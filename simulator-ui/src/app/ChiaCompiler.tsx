// import * as sdk from 'chia-wallet-sdk-wasm';



// interface CompileResult {
//   conditions: sdk.Program | null;
//   compiledProgram: sdk.Program  | null;
//   puzzleHash: string;
//   solution: null;
//   cost: number;
//   errorMessage: string;
//   puzzleAddress: string;
// }

// const compileProgram = (
//   source: string,
//   curriedParameters: sdk.Program[] = [],
//   parameters: sdk.Program[] = [],
//   prefix: string = 'txch'
// ): CompileResult => {
//   const { Clvm, toHex, Address } = sdk;

//   if (!source) throw new Error('Source code is required');

//   let puzzleHash = '';
//   let conditions: sdk.Program | null = null;
//   let solution = null;
//   let cost = 0;
//   let compiledProgram: sdk.Output | null = null;
//   let errorMessage = '';
//   let puzzleAddress = '';
//   let programOutput = sdk.Output;
//   try {
//     const clvm = new Clvm();

//     const parsed = clvm.parse(source);
//     compiledProgram = parsed.compile();

//     const puzzle = compiledProgram.value.puzzle();
//     puzzleHash = toHex(puzzle.puzzleHash);
//     puzzleAddress = new Address(puzzle.puzzleHash, prefix).encode();

//     if (curriedParameters.length > 0) {
//       const params = curriedParameters.map((p) => p.toAtom());
//       const curriedProgram = compiledProgram.value.curry(params);
//       compiledProgram = { value: curriedProgram };
//       const curriedPuzzle = curriedProgram.puzzle();
//       puzzleHash = toHex(curriedPuzzle.puzzleHash);
//       puzzleAddress = new Address(curriedPuzzle.puzzleHash, prefix).encode();
//     }

//     const paramList = parameters.length > 0
//       ? clvm.list(parameters.map((p) => clvm.atom(p.toAtom())))
//       : clvm.nil();

//     const output = compiledProgram.value.run(paramList, 100000n, false);
//     cost = output.cost;
//     conditions = output.value;
//   } catch (ex: any) {
//     errorMessage = ex.toString();
//     conditions = null;
//     puzzleHash = '';
//     compiledProgram = null;
//     cost = 0;
//     puzzleAddress = '';
//   }

//   return {
//     conditions,
//     compiledProgram,
//     puzzleHash,
//     solution,
//     cost,
//     errorMessage,
//     puzzleAddress,
//   };
// };

// export { compileProgram };
