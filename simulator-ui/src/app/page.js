'use client';
import { useState, useEffect, useRef } from 'react';
import * as sdk from 'chia-wallet-sdk-wasm';
import dynamic from 'next/dynamic';
import Parameters from './components/parameters';
import TopMenuBar from './components/topmenu';
import { compileProgram } from './ChiaCompiler';
import TerminalPanel from './components/terminal'; // Adjust path if needed
import Output from './components/output';

// Dynamic import for Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

// Register Chialisp language
function registerChialisp(monacoInstance) {
  monacoInstance.languages.register({ id: 'chialisp' });

  monacoInstance.languages.setMonarchTokensProvider('chialisp', {
    tokenizer: {
      root: [
        [/\b(mod|defun|let|if|quote|lambda|include)\b/, 'keyword'],
        [/\b(true|false|nil)\b/, 'constant'],
        [/[()]/, 'delimiter'],
        [/\b\d+\b/, 'number'],
        [/"[^"]*"/, 'string'],
        [/[a-zA-Z_+\-*\/=<>!?$%&|^~]+/, 'identifier'],
      ],
    },
  });

  monacoInstance.languages.setLanguageConfiguration('chialisp', {
    comments: {
      lineComment: ';',
    },
    brackets: [['(', ')']],
  });
}

export default function Home() {
  const editorRef = useRef(null);

  const [programSource, setProgramSource] = useState('');
  const [programParameters, setProgramParameters] = useState([]);
  const [programCurriedParameters, setProgramCurriedParameters] = useState([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');

  const [history, setHistory] = useState([]);
  const [conditions, setConditions] = useState('');
  const [compiledProgram, setCompiledProgram] = useState(null);
  const [compiledProgramText, setCompiledProgramText] = useState('');
  const [cost, setCost] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [puzzleHash, setPuzzleHash] = useState('');
  const [puzzleAddress, setPuzzleAddress] = useState('');
  const [activeTab, setActiveTab] = useState('output');

  useEffect(() => {
    fetchBlockHeight();
    fetchCurrentAddress();
  }, []);

  const fetchCurrentAddress = async () => {
    try {
      const res = await fetch('/api/address');
      const data = await res.json();
      if (data.output) {
        setCurrentAddress(data.output);
      }
    } catch (err) {
      console.error('Address fetch error:', err);
    }
  };

  const fetchBlockHeight = async () => {
    try {
      const res = await fetch('/api/blockheight');
      const data = await res.json();
      if (data.output) {
        setCurrentBlockHeight(parseInt(data.output));
      }
    } catch (err) {
      console.error('Block height error:', err);
    }
  };

  const nextBlock = async () => {
    try {
      const res = await fetch('/api/nextblock', { method: 'POST' });
      const data = await res.json();
      await fetchBlockHeight();
    } catch (err) {
      console.error('Next block error:', err);
    }
  };

  const handleCompileAndRun = () => {
    try {
      const source = editorRef.current?.getValue() ?? '';

      console.log(source);

      if (!source) return;

      setProgramSource(source);

      const clvm = new sdk.Clvm();

      const curried = programCurriedParameters.map((param) => {
        if (param.type === 'Text') return param.value;
        if (param.type === 'Int') return clvm.int(param.value?.toInt() ?? 0);
        if (param.type === 'Nil') return clvm.nil();
        return param.value;
      });

      const params = programParameters.map((param) => {
        if (param.type === 'Text') return param.value;
        if (param.type === 'Int') return clvm.int(param.value?.toInt() ?? 0);
        if (param.type === 'Nil') return clvm.nil();
        return param.value;
      });

      const result = compileProgram(source, curried, params, 'txch');

      const historyItem = {
        id: Date.now(),
        date: new Date()
          .toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          .replace(',', ''),
        source,
        output: result.errorMessage ? 'Failed' : result.conditions.unparse(),
        errorMessage: result.errorMessage || '',
        cost: result.cost,
      };

      setHistory((prev) => [...prev, historyItem]);
      setCost(result.cost);
      setConditions(result.conditions);
      setPuzzleHash(result.puzzleHash);
      setErrorMessage(result.errorMessage);
      setPuzzleAddress(result.puzzleAddress);
    } catch (e) {
      console.error('Compile error:', e);
    }
  };

  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    registerChialisp(monacoInstance);
    editor.addCommand(monacoInstance.KeyCode.F9, () => {
      nextBlock();
      fetchBlockHeight();
    });
  };

  return (
    <div className="min-h-screen bg-[#252526] text-white">
      <TopMenuBar
        onRun={handleCompileAndRun}
        onNextBlock={() => {
          nextBlock();
          fetchBlockHeight();
        }}
        onSave={() => {
          const source = editorRef.current?.getValue() ?? '';
          const blob = new Blob([source], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'program.clsp';
          a.click();
          URL.revokeObjectURL(url);
        }}
      />
      {/* Status Bar Below Top Menu */}
      <div className="flex justify-end items-center gap-6 px-4 py-1 bg-[#252526] text-sm text-gray-400 border-b border-[#333]">
        <div>
          <span className="text-white">Current Block:</span>{' '}
          {currentBlockHeight ?? '...'}
        </div>
        <div>
          <span className="text-white">Current Address:</span>{' '}
          {currentAddress || '...'}
        </div>
      </div>
      <div className="flex flex-col h-[calc(100vh-48px)]">
        {/* Main Panels */}
        <div className="flex flex-row flex-grow overflow-hidden">
          {/* Parameters */}
          <div className="w-[33%] min-w-[300px] max-w-[400px] overflow-hidden">
            <Parameters
              setProgramParameters={setProgramParameters}
              setProgramCurriedParameters={setProgramCurriedParameters}
            />
          </div>

          {/* Editor */}
          <div className="w-2/3 bg-[#1e1e1e] p-4 text-white">
            <h2 className="text-lg font-semibold mb-4">Source Code</h2>
            <div className="h-full border border-[#444] rounded overflow-hidden">
              <MonacoEditor
                defaultLanguage="chialisp"
                theme="vs-dark"
                defaultValue={programSource}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  fontFamily: 'monospace',
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border-t border-[#333] p-4">
          {/* Tabs */}
          <div className="flex border-b border-[#333] mb-2">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'output'
                  ? 'bg-[#2d2d2d] text-white border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'terminal'
                  ? 'bg-[#2d2d2d] text-white border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Terminal
            </button>
          </div>

          {activeTab === 'output' && (
            <div className="h-64">
              {' '}
              {/* Adjust height as needed */}
              <Output
                puzzleHash={puzzleHash}
                puzzleAddress={puzzleAddress}
                conditions={conditions}
                cost={cost}
                errorMessage={errorMessage}
              />
            </div>
          )}

          {activeTab === 'terminal' && <TerminalPanel />}
        </div>
      </div>
    </div>
  );
}
