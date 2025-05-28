import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET(req) {
  const url = new URL(req.url);
  const amount = url.searchParams.get('amount');
  const address = url.searchParams.get('address');

  if (!amount || !address) {
    return NextResponse.json({ error: "Missing amount or address" }, { status: 400 });
  }

  return new Promise((resolve) => {
    exec(`chia dev send -a ${amount} -t ${address}`, (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ output: stdout }));
      }
    });
  });
}
