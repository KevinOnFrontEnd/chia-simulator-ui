'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Parameters from './components/parameters';
import TopMenuBar from './components/topmenu';
// import { compileProgram } from './ChiaCompiler';
import TerminalPanel from './components/terminal';
import Output from './components/output';
import type * as monaco from 'monaco-editor';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

type Parameter = {
  type: 'Text' | 'Int' | 'Nil' | string;
  value: any;
};

type HistoryItem = {
  id: number;
  date: string;
  source: string;
  output: string;
  errorMessage: string;
  cost: number;
};

export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [programSource, setProgramSource] = useState('');
  const [programParameters, setProgramParameters] = useState<Parameter[]>([]);
  const [programCurriedParameters, setProgramCurriedParameters] = useState<Parameter[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number>(0);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [conditions, setConditions] = useState<any>(null);
  const [compiledProgram, setCompiledProgram] = useState<any>(null);
  const [compiledProgramText, setCompiledProgramText] = useState<string>('');
  const [cost, setCost] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [puzzleHash, setPuzzleHash] = useState<string>('');
  const [puzzleAddress, setPuzzleAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'output' | 'terminal'>('output');

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
      await fetch('/api/nextblock', { method: 'POST' });
      await fetchBlockHeight();
    } catch (err) {
      console.error('Next block error:', err);
    }
  };

  const handleCompileAndRun = () => {
    try {
      const source = editorRef.current?.getValue() ?? "";
      if (!source) return;

      //   setProgramSource(source);

      //   const clvm = new sdk.Clvm();

      //   const curried = programCurriedParameters.map((param) => {
      //     if (param.type === 'Text') return param.value;
      //     if (param.type === 'Int') return clvm.int(BigInt(param.value?.toInt?.() ?? 0));
      //     if (param.type === 'Nil') return clvm.nil();
      //     return param.value;
      //   });

      //   const params = programParameters.map((param) => {
      //     if (param.type === 'Text') return param.value;
      //     if (param.type === 'Int') return clvm.int(BigInt(param.value?.toInt?.() ?? 0));
      //     if (param.type === 'Nil') return clvm.nil();
      //     return param.value;
      //   });

      //   // const result = compileProgram(source, curried, params, 'txch');

      //   const historyItem: HistoryItem = {
      //     id: Date.now(),
      //     date: new Date()
      //       .toLocaleString('en-GB', {
      //         year: 'numeric',
      //         month: '2-digit',
      //         day: '2-digit',
      //         hour: '2-digit',
      //         minute: '2-digit',
      //         second: '2-digit',
      //         hour12: false,
      //       })
      //       .replace(',', ''),
      //     source,
      //     output: result.errorMessage ? 'Failed' : result.conditions.unparse(),
      //     errorMessage: result.errorMessage || '',
      //     cost: result.cost,
      //   };

      //   setHistory((prev) => [...prev, historyItem]);
      //   setCost(result.cost);
      //   setConditions(result.conditions);
      //   setPuzzleHash(result.puzzleHash);
      //   setErrorMessage(result.errorMessage);
      //   setPuzzleAddress(result.puzzleAddress);
    } catch (e) {
      console.error("Compile error:", e);
    }
  };

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;

    registerChialisp(monacoInstance);
    editor.addCommand(monacoInstance.KeyCode.F9, () => {
      nextBlock();
      fetchBlockHeight();
    });
  };

  return (
    <div className="min-h-screen bg-[#252526] text-white pb-12">
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

      {/* Status Bar */}
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

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Panels */}
        <div className="flex flex-col md:flex-row">
          {/* Parameters */}
          <div className="w-full flex-shrink-0 md:w-[33%] md:max-w-[400px]">
            <Parameters
              setProgramParameters={setProgramParameters}
              setProgramCurriedParameters={setProgramCurriedParameters}
            />
          </div>

          {/* Editor */}
          <div className="w-full md:w-2/3 bg-[#1e1e1e] p-4 text-white">
            <h2 className="text-lg font-semibold mb-4">Source Code</h2>
            <div className="h-[300px] border border-[#444] rounded overflow-hidden">
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

        {/* Output & Terminal */}
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

// Register Chialisp language (outside component)
function registerChialisp(monacoInstance: typeof monaco) {
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
