// app/api/nextblock/route.js
import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST() {
  return new Promise((resolve) => {
    exec('chia dev sim farm', (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ message: stdout.trim() }));
      }
    });
  });
}
