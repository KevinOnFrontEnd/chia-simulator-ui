import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET() {
  return new Promise((resolve) => {
    exec(`chia dev get_wallet_address`, (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ output: stdout }));
      }
    });
  });
}
