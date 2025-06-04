'use client';
import { useState } from 'react';

export default function TerminalPanel() {
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');

  const runCommand = async () => {
    if (!command.trim()) return;

    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    const data = await res.json();
    setTerminalOutput(data.output || data.error || 'No output');
    setCommand('');
  };

  return (
    <div className="space-y-2">
      <div className="bg-[#1a1a1a] text-gray-200 p-3 rounded font-mono text-sm h-40 overflow-y-auto border border-[#333]">
        <pre className="whitespace-pre-wrap">
          {terminalOutput ? terminalOutput : <span className="text-gray-500 italic">No terminal output yet.</span>}
        </pre>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand();
        }}
        className="flex items-center gap-2"
      >
        <span className="text-green-400 font-mono">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-1 bg-[#2d2d2d] text-white px-3 py-1.5 border border-[#444] rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Type a command and press Enter"
        />
      </form>
    </div>
  );
}
