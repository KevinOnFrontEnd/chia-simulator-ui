'use client';
import { useState } from 'react';

export default function Home() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');

  const runCommand = async () => {
    if (!command.trim()) return;

    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    const data = await res.json();
    setOutput(data.output || data.error || 'No output');
    setCommand("");
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <h1 className="text-xl text-center mb-4">Chia Simulator Terminal</h1>

      <div className="bg-gray-900 rounded-md p-4 h-[300px] overflow-auto mb-4 border border-green-600">
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-green-400">$</span>
        <input
          className="flex-1 bg-black border border-green-400 px-2 py-1 rounded text-green-300 placeholder-gray-400 outline-none"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. chia dev sim farm --blocks 10"
          onKeyDown={(e) => e.key === 'Enter' && runCommand()}
        />
        <button
          className="bg-green-600 text-black font-bold px-4 py-1 rounded hover:bg-green-500"
          onClick={runCommand}
        >
          Execute
        </button>
      </div>
    </div>
  );
}
