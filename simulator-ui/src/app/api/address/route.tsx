import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(): Promise<NextResponse> {
  try {
    const { stdout } = await execAsync('chia wallet get_address');
    return NextResponse.json({ output: stdout });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.stderr || error.message },
      { status: 500 }
    );
  }
}
