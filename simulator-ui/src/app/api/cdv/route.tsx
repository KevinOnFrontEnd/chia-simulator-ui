// app/api/command/route.ts

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { spawn } from "child_process";

const execAsync = promisify(exec);

export interface CDVCommandRequest {
  program: string;
  curry?: (string | number | boolean)[];
  solution?: (string | number | boolean)[];
}

export interface CDVCommandResponse {
  output: string;
  cost: number | null;
  bytecode: "original" | "curried";
  originalBytecode: string;
  curriedBytecode: string;
  puzzleHash: string;
  puzzleAddress: string;
  errormessage: string;
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

    const timestamp = Date.now();
    const fileName = `prog_${timestamp}`;
    const clspPath = `/tmp/${fileName}.clsp`;
    const hexPath = `/tmp/${fileName}.clsp.hex`;
    const curriedPath = `/tmp/${fileName}_curried.hex`;

    let executablePath = hexPath;
    let hasCurriedFile = false;

    try {
      // 📝 Write the Chialisp program to a temporary file
      await writeFile(clspPath, program);

      // 🏗 Compile the program
      const buildCmd = `cd /tmp && cdv clsp build ${fileName}.clsp`;
      console.log("Build command:", buildCmd);
      const buildOutput = await execAsync(buildCmd);
      console.log(buildOutput);

      // 🧐 Verify hex file was created
      try {
        const hexPathOutput = await execAsync(`ls ${hexPath}`);
        console.log(hexPathOutput);

        const hexContent = await execAsync(`cat ${hexPath}`);
        console.log(hexContent);
      } catch {
        throw new Error("Compilation failed - hex file not created");
      }

      // 📦 Get original program bytecode and hash
      const originalBytecode = (
        await execAsync(`cat ${hexPath}`)
      ).stdout.trim();
      const originalPuzzleHash = (
        await execAsync(`cdv clsp treehash ${hexPath}`)
      ).stdout.trim();

      console.log(originalBytecode);
      console.log(originalPuzzleHash);

      let curriedBytecode = "";
      let puzzleHash = originalPuzzleHash;
      let puzzleAddress = "";

      console.log(curry);

      // 🍳 Curry parameters if provided
      if (Array.isArray(curry) && curry.length > 0) {
        const curryArgs = curry
          .map(formatChialispValue)
          .map((arg) => `-a ${arg}`)
          .join(" ");

        const curryCmd = `cdv clsp curry ${hexPath} ${curryArgs} > ${curriedPath}`;
        console.log("Curry command:", curryCmd);
        var curryOutput = await execAsync(curryCmd);

        curriedBytecode = (await execAsync(`cat ${curriedPath}`)).stdout.trim();
        puzzleHash = (
          await execAsync(`cdv clsp treehash ${curriedPath}`)
        ).stdout.trim();

        executablePath = curriedPath;
        hasCurriedFile = true;
      }

      // 🎯 Generate address from the final puzzle hash
      try {
        const addressResult = await execAsync(`cdv encode ${puzzleHash}`);
        puzzleAddress = addressResult.stdout.trim();
        console.log("puzzle address: " + puzzleAddress);
      } catch (addressError) {
        console.log("Address generation failed:", addressError);
      }

      let output = "";
      let cost: number | null = null;

      // 🏃‍♂️ Execute puzzle if solution provided
      if (solution && Array.isArray(solution)) {
        console.log(solution);
        const solutionStr = solution.map(formatChialispValue).join(" ");
        const escapedSolution = solutionStr.replace(/(["`\\$])/g, "\\$1"); // Escape ", `, \, $
        console.log(`Running: brun -c ${executablePath} ${solutionStr}`);

        const err = solution.map(formatChialispValueForShell);
        console.log(err);

        try {
          const result = await runBrun(
            executablePath,
            solution.map(formatChialispValueForShell)
          );
          // const lines = result.stdout.trim().split("\n");

          // console.log(result);

          // if (lines.length >= 2) {
          //   const costMatch = lines[0].match(/cost\s*=\s*(\d+)/i);
          //   if (costMatch) {
          //     cost = parseInt(costMatch[1], 10);
          //   }
          //   output = lines[1].trim();
          // } else {
          //   output = result.stdout.trim();
          // }
        } catch (brunError: any) {
          throw new Error(
            `Execution failed: ${brunError.stderr || brunError.message}`
          );
        }
      } else {
        // ✅ Return success message if no solution provided
        output = hasCurriedFile
          ? "Program compiled and curried successfully"
          : "Program compiled successfully";
      }

      return NextResponse.json<CDVCommandResponse>({
        output,
        cost,
        bytecode: hasCurriedFile ? "curried" : "original",
        originalBytecode,
        curriedBytecode: hasCurriedFile ? curriedBytecode : "",
        puzzleHash,
        puzzleAddress,
        errormessage: "",
      });
    } finally {
      // 🧹 Clean up temp files
      await unlink(clspPath).catch(() => {});
      await unlink(hexPath).catch(() => {});
      if (hasCurriedFile) {
        await unlink(curriedPath).catch(() => {});
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

function formatChialispValueForShell(value: any): string {
  if (value === null || value === undefined) return "()";
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") {
    return `"${value.replace(/"/g, '\\"')}"`; // double-quoted and escaped
  }
  if (typeof value === "boolean") return value ? "1" : "()";
  return `"${String(value)}"`; // fallback to string
}

function formatChialispValue(value: any): string {
  if (value === null || value === undefined) {
    return "()";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    return `'("${value}")'`; // no quotes needed for spawn
  }
  if (typeof value === "boolean") {
    return value ? "1" : "()";
  }
  if (typeof value === "object" && typeof value.toString === "function") {
    return value.toString();
  }
  throw new Error(`Unsupported value type: ${typeof value}`);
}

function runBrun(filePath: string, solutionArgs: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // 🧹 Strip shell quotes if accidentally included
    const cleanArgs = solutionArgs.map((arg) =>
      typeof arg === "string" ? arg.replace(/^["']|["']$/g, "") : arg
    );

    const brun = spawn("brun", ["-c", filePath, ...cleanArgs]);

    let stdout = "";
    let stderr = "";

    brun.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    brun.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    brun.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`brun failed (code ${code}): ${stderr.trim()}`));
      }
    });
  });
}
