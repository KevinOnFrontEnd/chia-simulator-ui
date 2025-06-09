'use client'; // for app/page.js or wherever applicable
import React, { useState, useEffect, useMemo } from 'react';
import { XCircle } from 'lucide-react';
import * as sdk from 'chia-wallet-sdk-wasm';

function Parameters({ setProgramParameters, setProgramCurriedParameters }) {
  const { Clvm, sha256, Address, toHex } = sdk;
  const clvm = useMemo(() => new Clvm(), []);

  const [parameterType, setParameterType] = useState('Text');
  const [parameterValue, setParameterValue] = useState('');
  const [parameters, setParameters] = useState([]);
  const [curriedParameters, setCurriedParameters] = useState([]);
  const [activeTab, setActiveTab] = useState('parameters');
  const [parsedParams, setParsedParams] = useState([]);

  useEffect(() => {
    const activeList =
      activeTab === 'parameters' ? parameters : curriedParameters;
    const parsed = activeList.map((param) => {
      let displayValue = '';
      try {
        if (
          param.type === 'Text' ||
          param.type === 'Bool' ||
          param.type === 'Int'
        ) {
          displayValue = param.originalValue ?? param.value.toString();
        } else if (param.type === 'Nil') {
          displayValue = 'Nil';
        } else if (param.type === 'Address') {
          return param;
        } else {
          displayValue = param.value.unparse().replace(/"/g, '');
        }
      } catch (e) {
        try {
          displayValue = param.value.toString();
        } catch {
          displayValue = '[unparse error]';
        }
      }

      return { ...param, displayValue };
    });
    setParsedParams(parsed);
  }, [parameters, curriedParameters, activeTab]);

  const moveParameter = (index, direction, isCurried) => {
    const list = isCurried ? [...curriedParameters] : [...parameters];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
    if (isCurried) {
      setCurriedParameters(list);
      setProgramCurriedParameters(list);
    } else {
      setParameters(list);
      setProgramParameters(list);
    }
  };

  const handleAddParameter = (isCurried) => {
    let newParameter = {};
    try {
      switch (parameterType) {
        case 'SHA256': {
          const textAtom = clvm.string(parameterValue);
          const hashBytes = sha256(textAtom.toAtom());
          const hash = clvm.atom(hashBytes);
          newParameter = {
            type: 'SHA256',
            value: hash,
            originalValue: parameterValue,
          };
          break;
        }
        case 'Text': {
          const hashBytes1 = clvm.string(parameterValue).toAtom();
          const hashAtom1 = clvm.atom(hashBytes1);
          newParameter = {
            type: 'Text',
            value: hashAtom1,
            originalValue: parameterValue,
          };
          break;
        }
        case 'Nil':
          newParameter = { type: 'Nil', value: 'value does not matter' };
          break;
        case 'Bool':
          newParameter = {
            type: 'Bool',
            value: clvm.bool(parameterValue),
            originalValue: parameterValue,
          };
          break;
        case 'Int': {
          const val = parseInt(parameterValue);
          if (isNaN(val)) return;
          newParameter = {
            type: 'Int',
            value: clvm.int(val),
            originalValue: parameterValue,
          };
          break;
        }
        case 'Address': {
          const hash = Address.decode(parameterValue).puzzleHash;
          const hashProgram = clvm.atom(hash);
          const s = toHex(hash);
          newParameter = {
            type: 'Address',
            value: hashProgram,
            originalValue: parameterValue,
            puzzleHashHex: s,
          };
          break;
        }
      }
    } catch (err) {
      alert('Invalid input or type error');
      console.error(err);
      return;
    }

    const updated = isCurried
      ? [...curriedParameters, newParameter]
      : [...parameters, newParameter];
    if (isCurried) {
      setCurriedParameters(updated);
      setProgramCurriedParameters(updated);
    } else {
      setParameters(updated);
      setProgramParameters(updated);
    }

    setParameterValue('');
  };

  const handleRemoveParameter = (index, isCurried) => {
    const updated = isCurried
      ? curriedParameters.filter((_, i) => i !== index)
      : parameters.filter((_, i) => i !== index);

    if (isCurried) {
      setCurriedParameters(updated);
      setProgramCurriedParameters(updated);
    } else {
      setParameters(updated);
      setProgramParameters(updated);
    }
  };

  return (
    <div className="bg-[#1e1e1e] text-white p-4 min-h-[200px] overflow-auto border-r border-[#333]">
      <h1 className="text-xl font-semibold mb-4">Parameters</h1>

      {/* Tabs */}
      <div className="flex mb-4 rounded overflow-hidden border border-[#333]">
        {['parameters', 'curriedParameters'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-1/2 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3a3a3a]'
            }`}
          >
            {tab === 'parameters' ? 'Parameters' : 'Curried Parameters'}
          </button>
        ))}
      </div>

      {/* Input Fields + Add Link */}
      <div className="mb-4">
        <div className="flex flex-col gap-2">
          <select
            value={parameterType}
            onChange={(e) => setParameterType(e.target.value)}
            className="p-2 bg-[#2d2d2d] text-white border border-[#444] rounded"
          >
            <option value="Text">Text</option>
            <option value="Int">Int</option>
            <option value="SHA256">SHA256</option>
            <option value="Bool">Boolean</option>
            <option value="Nil">Nil</option>
            <option value="Address">Address</option>
          </select>

          <input
            type="text"
            value={parameterValue}
            onChange={(e) => setParameterValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddParameter(activeTab === 'curriedParameters');
              }
            }}
            placeholder="Enter value and press Enter"
            className="px-3 py-2 bg-[#2d2d2d] text-white border border-[#444] rounded"
          />

          <button
            onClick={() =>
              handleAddParameter(activeTab === 'curriedParameters')
            }
            className="cursor-pointer text-blue-500 text-sm underline hover:text-blue-400 mt-1 self-end"
          >
            Add
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-[60vh] border border-[#333] rounded">
        <table className="w-full table-auto text-sm">
          <thead className="bg-[#2d2d2d] text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left border-b border-[#333]">
                Type
              </th>
              <th className="px-4 py-2 text-left border-b border-[#333]">
                Value
              </th>
              <th className="px-4 py-2 text-left border-b border-[#333]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {parsedParams.length > 0 ? (
              parsedParams.map((param, index) => (
                <tr
                  key={index}
                  className="border-t border-[#333] hover:bg-[#2a2a2a]"
                >
                  <td className="px-4 py-2">{param.type}</td>
                  <td className="px-4 py-2">
                    {param.type === 'Address' ? (
                      <div>
                        <div className="text-white">
                          <strong>Address:</strong> {param.originalValue}
                        </div>
                        <div className="text-gray-400 text-xs">
                          <strong>Puzzle Hash:</strong> {param.puzzleHashHex}
                        </div>
                      </div>
                    ) : (
                      param.displayValue
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() =>
                        handleRemoveParameter(
                          index,
                          activeTab === 'curriedParameters'
                        )
                      }
                      className="text-red-400 hover:text-red-600"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        moveParameter(
                          index,
                          'up',
                          activeTab === 'curriedParameters'
                        )
                      }
                      className="hover:text-blue-400"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() =>
                        moveParameter(
                          index,
                          'down',
                          activeTab === 'curriedParameters'
                        )
                      }
                      className="hover:text-blue-400"
                    >
                      ↓
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-4 py-4 text-center text-gray-500 italic"
                >
                  No {activeTab === 'parameters' ? '' : 'curried '}parameters
                  added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Parameters;
