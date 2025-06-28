// app/api/command/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

export interface CDVCommandRequest {
  program: string;
  curry?: (string | number | boolean)[];
  solution?: (string | number | boolean)[];
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json()) as CDVCommandRequest;
    const { program, curry, solution } = body;

    if (!program || typeof program !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'program'" },
        { status: 400 }
      );
    }

    // Use timestamp for simpler file names
    const timestamp = Date.now();
    const fileName = `prog_${timestamp}`;
    const clspPath = `/tmp/${fileName}.clsp`;
    const hexPath = `/tmp/${fileName}.clsp.hex`;
    const curriedPath = `/tmp/${fileName}_curried.hex`;

    // Declare these outside try block so they're accessible in finally
    let executablePath = hexPath;
    let hasCurriedFile = false;

    try {
      // Step 1: Write the Chialisp program to a temporary file
      await writeFile(clspPath, program);

      // Step 2: Compile the program - change to /tmp directory first
      const buildCmd = `cd /tmp && cdv clsp build ${fileName}.clsp`;
      console.log("Build command:", buildCmd);
      await execAsync(buildCmd);

      // Verify hex file was created
      try {
        await execAsync(`ls ${hexPath}`);
      } catch {
        throw new Error("Compilation failed - hex file not created");
      }

      // Step 3: Get original program bytecode and hash
      const originalBytecode = (
        await execAsync(`cat ${hexPath}`)
      ).stdout.trim();
      const originalPuzzleHashResult = await execAsync(
        `cdv clsp treehash ${hexPath}`
      );
      const originalPuzzleHash = originalPuzzleHashResult.stdout.trim();

      // Initialize with original values
      let curriedBytecode = "";
      let puzzleHash = originalPuzzleHash;
      let puzzleAddress = "";

      // Step 4: Handle currying
      if (Array.isArray(curry) && curry.length > 0) {
        // Format curry arguments properly
        const curryArgs = curry
          .map(formatChialispValue)
          .map((arg) => `-a ${arg}`)
          .join(" ");

        // Curry the compiled program (not the source)
        const curryCmd = `cdv clsp curry ${hexPath} ${curryArgs} > ${curriedPath}`;
        console.log("Curry command:", curryCmd);
        await execAsync(curryCmd);

        // Get curried bytecode and hash
        curriedBytecode = (await execAsync(`cat ${curriedPath}`)).stdout.trim();
        const curriedPuzzleHashResult = await execAsync(
          `cdv clsp treehash ${curriedPath}`
        );
        puzzleHash = curriedPuzzleHashResult.stdout.trim(); // Use curried hash

        executablePath = curriedPath; // Use curried version for execution
        hasCurriedFile = true;
      }

      // Step 5: Generate address from the final puzzle hash
      try {
        const addressResult = await execAsync(`cdv encode ${puzzleHash}`);
        puzzleAddress = addressResult.stdout.trim();
      } catch (addressError) {
        console.log("Address generation failed:", addressError);
        // Don't fail the whole request, just leave empty
      }

      let output: string = "";
      let cost: number | null = null;

      // Step 6: Execute with solution or return execution result
      if (solution && Array.isArray(solution)) {
        // Format solution for execution
        const solutionStr = `'(${solution
          .map(formatChialispValue)
          .join(" ")})'`;

        // Try brun first (faster), fallback to cdv
        try {
          const result = await execAsync(
            `brun -c ${executablePath} ${solutionStr}`
          );

          const lines = result.stdout.trim().split("\n");
          if (lines.length >= 2) {
            // First line: "cost = 1326"
            const costMatch = lines[0].match(/cost\s*=\s*(\d+)/i);
            if (costMatch) {
              cost = parseInt(costMatch[1], 10);
            }

            // Second line: "88" (the actual result)
            output = lines[1].trim();
          } else {
            // Fallback if format is different
            output = result.stdout.trim();
          }
        } catch (brunError) {
          console.log("brun failed, trying cdv:", brunError);
          // Fallback to cdv
          const cdvArgs = solution
            .map(formatChialispValue)
            .map((arg) => `-a ${arg}`)
            .join(" ");
          const result = await execAsync(
            `cdv clsp run ${executablePath} ${cdvArgs}`
          );
          output = result.stdout.trim();
        }
      } else {
        // Return execution info instead of bytecode since we're returning bytecode separately
        output = hasCurriedFile
          ? "Program compiled and curried successfully"
          : "Program compiled successfully";
      }

      return NextResponse.json({
        output,
        cost,
        bytecode: hasCurriedFile ? "curried" : "original",
        originalBytecode,
        curriedBytecode: hasCurriedFile ? curriedBytecode : "", // Empty if no currying
        puzzleHash,
        puzzleAddress,
        errormessage: "",
      });
    } finally {
      // Clean up temp files
      try {
        await unlink(clspPath).catch(() => {});
        await unlink(hexPath).catch(() => {});
        if (hasCurriedFile) {
          await unlink(curriedPath).catch(() => {});
        }
      } catch (cleanupError) {
        console.warn("Cleanup error:", cleanupError);
      }
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: error.stderr || error.message || "Unknown error",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

// Helper function to format JavaScript values for Chialisp
function formatChialispValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) {
    return "()";
  } else if (typeof value === "number") {
    return value.toString();
  } else if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return value; // Hex bytes
    } else {
      return `"${value}"`; // Quoted string
    }
  } else if (typeof value === "boolean") {
    return value ? "1" : "()";
  } else {
    return `"${value}"`;
  }
}