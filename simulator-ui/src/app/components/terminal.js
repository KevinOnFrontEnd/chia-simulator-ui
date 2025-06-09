'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TerminalPanel() {
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleRemoveHistoryItem = (indexToRemove) => {
    setHistory((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (selectedIndex >= indexToRemove) {
      setSelectedIndex((prev) => Math.max(-1, prev - 1));
    }
  };

  const runCommand = async () => {
    if (!command.trim()) return;

    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    const data = await res.json();
    setTerminalOutput(data.output || data.error || 'No output');

    // Update history if command is new
    setHistory((prev) => (prev.includes(command) ? prev : [command, ...prev]));
    setCommand('');
    setShowHistory(false);
  };

  const handleHistorySelect = (cmd) => {
    setCommand(cmd);
    inputRef.current?.focus();
    setShowHistory(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#command-input-wrapper')) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showHistory && dropdownRef.current) {
      dropdownRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [showHistory]);

  return (
    <div className="space-y-2">
      <div className="bg-[#1a1a1a] text-gray-200 p-3 rounded font-mono text-sm h-40 overflow-y-auto border border-[#333]">
        <pre className="whitespace-pre-wrap">
          {terminalOutput ? (
            terminalOutput
          ) : (
            <span className="text-gray-500 italic">
              No terminal output yet.
            </span>
          )}
        </pre>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand();
        }}
        className="flex items-center gap-2 relative"
        id="command-input-wrapper"
      >
        <span className="text-green-400 font-mono">$</span>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full bg-[#2d2d2d] text-white px-3 py-1.5 border border-[#444] rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Type a command and press Enter"
          />

          {showHistory && history.length > 0 && (
            <ul
              ref={dropdownRef}
              className="absolute bottom-full left-0 mb-1 w-full bg-[#2d2d2d] border border-[#444] rounded shadow-lg z-10 max-h-[160px] overflow-y-auto transition-all duration-150 ease-out"
            >
              {history.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-3 py-1.5 text-sm text-white hover:bg-[#3a3a3a] cursor-pointer font-mono"
                >
                  <span
                    onClick={() => handleHistorySelect(item)}
                    className="flex-1 truncate"
                  >
                    {item}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent item selection
                      handleRemoveHistoryItem(index);
                    }}
                    className="ml-2 text-red-500 hover:text-red-300 text-xs"
                    title="Remove from history"
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="text-white hover:text-blue-400"
        >
          {showHistory ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
