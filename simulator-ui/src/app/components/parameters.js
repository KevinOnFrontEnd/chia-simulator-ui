import React, { useState, useEffect, useMemo } from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import * as sdk from "chia-wallet-sdk-wasm";

function Parameters({ setProgramParameters, setProgramCurriedParameters }) {
    const { Clvm, sha256, Address, toHex } = sdk;

    // Memoize Clvm instance to avoid mismatch
    const clvm = useMemo(() => new Clvm(), []);

    const [parameterType, setParameterType] = useState("Text");
    const [parameterValue, setParameterValue] = useState("");
    const [parameters, setParameters] = useState([]);
    const [curriedParameters, setCurriedParameters] = useState([]);
    const [activeTab, setActiveTab] = useState("parameters");
    const [parsedParams, setParsedParams] = useState([]);

    useEffect(() => {
        console.log("Mounted");
        return () => {
            console.log("Unmounted");
        };
    }, []);

    // Recompute parsed display strings client-side
    useEffect(() => {
        const activeList = activeTab === "parameters" ? parameters : curriedParameters;
        const parsed = activeList.map((param) => {
        let displayValue = "";
        try {
            // Prefer originalValue for simple types
            if (param.type === "Text" || param.type === "Bool" || param.type === "Int") {
            displayValue = param.originalValue ?? param.value.toString();
            } else if (param.type === "Nil") {
            displayValue = "Nil";
            } else if (param.type === "Address") {
            return param; // Already has formatted fields
            } else {
            // Fallback to unparse for complex types
            displayValue = param.value.unparse().replace(/"/g, "");
            }
        } catch (e) {
            try {
            displayValue = param.value.toString();
            } catch {
            displayValue = "[unparse error]";
            }
        }

        return { ...param, displayValue };
        });
        setParsedParams(parsed);
    }, [parameters, curriedParameters, activeTab]);

    const moveParameter = (index, direction, isCurried) => {
        const list = isCurried ? [...curriedParameters] : [...parameters];
        const swapIndex = direction === "up" ? index - 1 : index + 1;
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
                newParameter = { type: 'Int', value: clvm.int(val) };
                break;
              }
              case 'Address': {
                const hash = Address.decode(parameterValue).puzzleHash; // Uint8Array
                const hashProgram = clvm.atom(hash); // ✅ use bytes directly, NOT hex
                const s = toHex(hash); // only for display purposes

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
            alert("Invalid input or type error");
            console.error(err);
            return;
        }

        if (isCurried) {
            const updated = [...curriedParameters, newParameter];
            setCurriedParameters(updated);
            setProgramCurriedParameters(updated);
        } else {
            const updated = [...parameters, newParameter];
            setParameters(updated);
            setProgramParameters(updated);
        }

        setParameterValue("");
    };

    const handleRemoveParameter = (index, isCurried) => {
        if (isCurried) {
            const updated = curriedParameters.filter((_, i) => i !== index);
            setCurriedParameters(updated);
            setProgramCurriedParameters(updated);
        } else {
            const updated = parameters.filter((_, i) => i !== index);
            setParameters(updated);
            setProgramParameters(updated);
        }
    };

    return (
      <div className="rounded-lg border border-gray-300">
        <div className="text-center p-4 bg-gray-200 rounded-t-lg ">
          <h1 className="text-xl font-bold">Parameters</h1>
        </div>
        <div className="border-b border-gray-300 flex mb-4">
          {['parameters', 'curriedParameters'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 p-2 text-center ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab === 'parameters' ? 'Parameters' : 'Curried Parameters'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-4 p-2">
          <select
            value={parameterType}
            onChange={(e) => setParameterType(e.target.value)}
            className="p-2 text-base border border-gray-300 rounded-md"
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
            className="flex-1 p-2 text-base border border-gray-300 rounded-md"
          />
          <button
            onClick={() =>
              handleAddParameter(activeTab === 'curriedParameters')
            }
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add (Enter)
          </button>
        </div>

        <div className="flex-grow overflow-auto p-2">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Type</th>
                <th className="border border-gray-300 px-4 py-2">Value</th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {parsedParams.length > 0 ? (
                parsedParams.map((param, index) => (
                  <tr key={index} className="text-center">
                    <td className="border border-gray-300 px-4 py-2">
                      {param.type}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 truncate">
                      {param.type === 'Address' ? (
                        <div className="flex flex-col text-left">
                          <div>
                            <strong>Address:</strong> {param.originalValue}
                          </div>
                          <div className="text-gray-400 text-sm">
                            <strong>Puzzle Hash:</strong> {param.puzzleHashHex}
                          </div>
                        </div>
                      ) : (
                        (param.displayValue ?? '')
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() =>
                          handleRemoveParameter(
                            index,
                            activeTab === 'curriedParameters'
                          )
                        }
                        className="text-red-500 hover:text-red-700 mr-2"
                      >
                        <XCircleIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() =>
                          moveParameter(
                            index,
                            'up',
                            activeTab === 'curriedParameters'
                          )
                        }
                        className="text-blue-500 hover:text-blue-700 mr-1"
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
                        className="text-blue-500 hover:text-blue-700"
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
                    className="border border-gray-300 px-4 py-2 text-center text-gray-500 italic"
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
