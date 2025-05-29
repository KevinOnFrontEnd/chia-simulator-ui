import React, { useState } from "react";

const Output = ({ puzzleHash, conditions, cost, puzzleAddress, errorMessage }) => {
    // State to track which field was copied
    const [copiedField, setCopiedField] = useState(null);

    // Function to copy text to clipboard and show feedback
    const handleCopy = (text, field) => {
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedField(field);
                // Reset feedback after 2 seconds
                setTimeout(() => setCopiedField(null), 2000);
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 rounded-lg border border-gray-300">
            {/* Header with centered text */}
            <div className="text-center p-4 bg-gray-200 rounded-t-lg">
                <h1 className="text-xl font-bold">Output</h1>
            </div>

            {/* Output Section */}
            <div className="flex-grow bg-black text-white rounded-b-lg overflow-auto p-4">
                <div className="whitespace-pre-wrap text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Puzzle Hash: </span>
                        <span className="text-green-400">{puzzleHash || ""}</span>
                        {puzzleHash && (
                            <button
                                onClick={() => handleCopy(puzzleHash, "puzzleHash")}
                                className="pl-2 text-blue-400 hover:underline text-xs"
                            >
                                {copiedField === "puzzleHash" ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Puzzle address: </span>
                        <span className="text-green-400">{puzzleAddress || ""}</span>
                        {puzzleAddress && (
                            <button
                                onClick={() => handleCopy(puzzleAddress, "puzzleAddress")}
                                className="pl-2 text-blue-400 hover:underline text-xs"
                            >
                                {copiedField === "puzzleAddress" ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>
                    <br />
                    <h2 className="underline font-bold">Run output</h2>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Conditions: </span>
                        <span className="text-green-400">
                            {conditions ? conditions.unparse() : "No output yet."}
                        </span>
                        {conditions && (
                            <button
                                onClick={() => handleCopy(conditions.unparse(), "conditions")}
                                className="pl-2 text-blue-400 hover:underline text-xs"
                            >
                                {copiedField === "conditions" ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Cost: </span>
                        <span className="text-green-400">{cost || ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Error: </span>
                        <span className="text-green-400">
                            {errorMessage != null ? errorMessage : ""}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Output;