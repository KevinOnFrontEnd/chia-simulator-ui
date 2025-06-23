'use client';
import React, { useState } from "react";

interface OutputProps {
  puzzleHash?: string;
  puzzleAddress?: string;
  cost?: number | string;
  errorMessage?: string;
  conditions?: {
    unparse: () => string;
  } | null;
}

const Output: React.FC<OutputProps> = ({
  puzzleHash,
  puzzleAddress,
  cost,
  errorMessage,
  conditions,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded border border-[#333] text-sm text-white font-mono p-4 space-y-3 overflow-auto">
      {/* Puzzle Hash */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-300">Puzzle Hash:</span>
        <span className="text-green-400 break-all">{puzzleHash || ""}</span>
        {puzzleHash && (
          <button
            onClick={() => handleCopy(puzzleHash, "puzzleHash")}
            className="text-blue-400 hover:underline text-xs"
          >
            {copiedField === "puzzleHash" ? "Copied!" : "Copy"}
          </button>
        )}
      </div>

      {/* Puzzle Address */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-300">Puzzle Address:</span>
        <span className="text-green-400 break-all">{puzzleAddress || ""}</span>
        {puzzleAddress && (
          <button
            onClick={() => handleCopy(puzzleAddress, "puzzleAddress")}
            className="text-blue-400 hover:underline text-xs"
          >
            {copiedField === "puzzleAddress" ? "Copied!" : "Copy"}
          </button>
        )}
      </div>

      {/* Run Output */}
      <div>
        <div className="font-semibold text-gray-300 underline mb-1">Run Output</div>

        {/* Conditions */}
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-300">Conditions:</span>
          <span className="text-green-400 break-all flex-1">
            {conditions ? conditions.unparse() : "No output yet."}
          </span>
          {conditions && (
            <button
              onClick={() => handleCopy(conditions.unparse(), "conditions")}
              className="text-blue-400 hover:underline text-xs"
            >
              {copiedField === "conditions" ? "Copied!" : "Copy"}
            </button>
          )}
        </div>

        {/* Cost */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-300">Cost:</span>
          <span className="text-green-400">{cost ?? ""}</span>
        </div>

        {/* Error */}
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-300">Error:</span>
          <span className="text-green-400 whitespace-pre-wrap break-all">
            {errorMessage ?? ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Output;
