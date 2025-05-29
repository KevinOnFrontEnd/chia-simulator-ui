'use client';
import { useState, useEffect } from 'react';
import Output from "./components/output"
import Parameters from "./components/parameters";
import { PlayIcon } from "@heroicons/react/24/solid";
import * as sdk from 'chia-wallet-sdk-wasm';
import { compileProgram } from './ChiaCompiler';

export default function Home() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [programParameters, setProgramParameters] = useState([]);
  const [programCurriedParameters, setProgramCurriedParameters] = useState([]); // Curried Parameters State
    const [history, setHistory] = useState([]);
  const [programSource, setProgramSource] = useState(""); //raw source text
  const [conditions, setConditions] = useState(""); //raw output from running program
  const [compiledProgram, setCompiledProgram] = useState(null);
  const [compiledProgramText, setCompiledProgramText] = useState("");
   const [cost, setCost] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
    const [copyText, setCopyText] = useState("Copy Source");
  
  //outputs
  const [puzzleHash, setPuzzleHash] = useState("");
  const [puzzleAddress, setPuzzleAddress] = useState("");
  const [deployPopup, setDeployPopup] = useState(false);
  const [valueToSend, setValueToSend] = useState("");

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F8") {
        event.preventDefault(); // Prevent any default browser behavior
        handleCompileAndRun();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [programSource, programParameters, programCurriedParameters]); // Dependencies to ensure latest state

const handleCompileAndRun = () => {
    try {
      if (programSource !== "") {
        
        const clvm = new sdk.Clvm();
        let curriedvalues = (programCurriedParameters ?? []).map(param => {
        switch (param.type) {
          case "Text":
             return param.value; // Use raw atom
          case "Int":
            return clvm.int(param.value?.toInt() ?? 0);
          case "SHA256":
          case "Address":
          case "Bool":
            return param.value;
          case "Nil":
            return clvm.nil();
          default:
            return param.value;
        }
      });

      let values = (programParameters ?? []).map(param => {
        switch (param.type) {
          case "Text":
            return param.value; // Use raw atom
          case "Int":
            return clvm.int(param.value?.toInt() ?? 0);
          case "SHA256":
          case "Address":
          case "Bool":
            return param.value;
          case "Nil":
            return clvm.nil();
          default:
            return param.value;
        }
      });


        
        let result = compileProgram(programSource, curriedvalues, values, "txch");
        
        // Create history item
        const historyItem = {
          id: Date.now(),
          date: new Date().toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(',', ''), // Format: "05/19/2025 11:27:01"
          source: programSource,
          output: result.errorMessage ? "Failed" : result.conditions.unparse(),
          errorMessage: result.errorMessage || "",
          cost: result.cost,
        };

        // Update history state
        setHistory(prevHistory => [...prevHistory, historyItem]);
        
        setCost(result.cost)
        setConditions(result.conditions)
        setPuzzleHash(result.puzzleHash);
        setErrorMessage(result.errorMessage);
        setPuzzleAddress(result.puzzleAddress);
      }
    }
    catch (e) {
      console.log(e);
    }
  };

  const handleCopy = (e) => {
    e.preventDefault(); // Prevent the default anchor behavior
    navigator.clipboard.writeText(programSource);
    setCopyText("Copied"); // Change text to Copied!

    setTimeout(() => {
      setCopyText("Copy Source"); // Change it back after 5 seconds
    }, 5000);
  };

  const handleCloseCoinSpendDialog = () => {
    setIsSpendCoinModalVisable(false);
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


<div className="flex flex-wrap md:flex-nowrap gap-6 my-8">
  {/* Source Editor */}
  <div className="flex-1 min-w-[300px]">
    <div className="text-center p-4 bg-gray-200 rounded-t-md">
      <h1 className="text-xl font-bold">Source</h1>
    </div>

    <textarea
      id="source"
      value={programSource}
      onChange={(e) => setProgramSource(e.target.value)}
      placeholder="Enter source code..."
      rows="15"
      className="w-full p-4 text-base border border-gray-300 rounded-b-md resize-none"
    />

    <div className="flex items-center justify-between mt-2">
      <button
        onClick={handleCompileAndRun}
        className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
      >
        <PlayIcon className="w-5 h-5 mr-2" />
        Run (F8)
      </button>
      <a
        href="#copy"
        onClick={handleCopy}
        className="text-gray-500 hover:text-gray-700 text-sm"
      >
        {copyText}
      </a>
    </div>
  </div>

  {/* Parameters Panel */}
  <div className="flex-1 min-w-[300px]">
    <Parameters
      setProgramParameters={setProgramParameters}
      setProgramCurriedParameters={setProgramCurriedParameters}
    />
  </div>
</div>



      <div>
        <Output
          puzzleHash={puzzleHash}
          conditions={conditions}
          cost={cost}
          puzzleAddress={puzzleAddress}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}
