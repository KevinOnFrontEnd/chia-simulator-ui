// app/api/command/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

interface CommandRequest {
  program: string;
  curry?: (string | bigint | Uint8Array | boolean)[];
  solution?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json()) as CommandRequest;
    const { program, curry, solution } = body;

    if (!program || typeof program !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid 'program'" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const clspPath = `/tmp/${id}.clsp`;
    const curriedPath = `/tmp/${id}.curried.hex`;

    // Write the Chialisp program to a temporary file
    await writeFile(clspPath, program);

    // Format curry arguments if any
    const curryArg =
      Array.isArray(curry) && curry.length > 0
        ? `-a '(${curry.map(v => (typeof v === 'string' ? `"${v}"` : v)).join(' ')})'`
        : '';

    // Curry the program using cdv
    const curryCmd = `cdv clsp curry ${clspPath} ${curryArg} > ${curriedPath}`;
    await execAsync(curryCmd);

    let output: string = '';
    let cost: number | null = null;

    if (solution) {
      const result = await execAsync(`brun -c ${curriedPath} '${solution}'`);
      const match = result.stdout.match(/Cost:\s*(\d+)\s*Result:\s*(.*)/s);
      if (match) {
        cost = parseInt(match[1], 10);
        output = match[2].trim();
      } else {
        output = result.stdout.trim();
      }
    } else {
      output = (await execAsync(`cat ${curriedPath}`)).stdout.trim();
    }

    // Clean up temp files
    await unlink(clspPath);
    await unlink(curriedPath);

    return NextResponse.json({ output, cost });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.stderr || error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
