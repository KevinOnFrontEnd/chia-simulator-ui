// app/api/nextblock/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(): Promise<NextResponse> {
  try {
    const { stdout } = await execAsync('chia dev sim farm');
    return NextResponse.json({ message: stdout.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.stderr || error.message },
      { status: 500 }
    );
  }
}
