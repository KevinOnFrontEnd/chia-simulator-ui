import { FileText, Play, ArrowRight, Loader2 } from "lucide-react";
import React from "react";

interface TopMenuBarProps {
  onRun: () => void;
  onNextBlock: () => void;
  onSave: () => void;
  isCompiling: boolean;
}

export default function TopMenuBar({
  onRun,
  onNextBlock,
  onSave,
  isCompiling,
}: TopMenuBarProps) {
  return (
    <div className="w-full bg-[#1e1e1e] text-white flex items-center px-4 py-2 shadow-md">
      <div className="flex space-x-2 text-sm font-medium">
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-[#2d2d2d]"
        >
          <FileText className="w-4 h-4 text-green-500" />
          Save As
        </button>

        <button
          onClick={onRun}
          disabled={isCompiling}
          className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
            isCompiling
              ? "bg-[#2d2d2d] text-gray-400 cursor-not-allowed"
              : "hover:bg-[#2d2d2d] text-white"
          }`}
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
              Compiling...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-green-500" />
              Run
            </>
          )}
        </button>

        <button
          onClick={onNextBlock}
          className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-[#2d2d2d]"
        >
          <ArrowRight className="w-4 h-4 text-green-500" />
          Next Block (F9)
        </button>
      </div>
    </div>
  );
}
