// app/api/send/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const amount = url.searchParams.get('amount');
  const address = url.searchParams.get('address');

  if (!amount || !address) {
    return NextResponse.json({ error: 'Missing amount or address' }, { status: 400 });
  }

  const amountNum = Number(amount);
  const addressPattern = /^[a-z0-9]{20,}$/i; // loose chia address check

  if (isNaN(amountNum) || amountNum <= 0 || !addressPattern.test(address)) {
    return NextResponse.json({ error: 'Invalid amount or address format' }, { status: 400 });
  }

  try {
    const { stdout } = await execAsync(`chia dev send -a ${amount} -t ${address}`);
    return NextResponse.json({ output: stdout.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.stderr || error.message },
      { status: 500 }
    );
  }
}
