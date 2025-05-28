import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req) {
  const { command } = await req.json();

  if (!command || typeof command !== 'string') {
    return NextResponse.json({ error: "Missing or invalid 'command'" }, { status: 400 });
  }

  return new Promise((resolve) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }));
      } else {
        resolve(NextResponse.json({ output: stdout }));
      }
    });
  });
}
