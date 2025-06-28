// app/api/command/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { command } = await req.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: "Missing or invalid 'command'" }, { status: 400 });
    }

    const { stdout } = await execAsync(command);
    return NextResponse.json({ output: stdout });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.stderr || error.message },
      { status: 500 }
    );
  }
}
