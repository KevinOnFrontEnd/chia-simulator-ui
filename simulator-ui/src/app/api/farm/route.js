import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET(req) {
  const url = new URL(req.url);
  const blocks = url.searchParams.get('blocks') || '1';

  return new Promise((resolve) => {
    exec(`chia dev sim farm --blocks ${blocks}`, (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ output: stdout }));
      }
    });
  });
}
