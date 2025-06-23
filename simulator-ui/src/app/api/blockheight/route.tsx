import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(): Promise<NextResponse> {
  try {
    const { stdout } = await execAsync(
      `chia rpc full_node get_blockchain_state | jq '.blockchain_state.peak.height'`
    );
    return NextResponse.json({ output: stdout.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.stderr || error.message },
      { status: 500 }
    );
  }
}
