import * as sdk from 'chia-wallet-sdk-wasm';

function inspectProgram(program, label = "value") {
  console.log(`\n=== Inspecting ${label} ===`);
  try {
    const isAtom = program.isAtom();
    console.log(`Type: ${program.constructor.name}`);
    console.log(`Is atom? ${isAtom}`);

    if (isAtom) {
      const asString = program.toString();
      console.log(`Atom content (string): ${asString}`);
    } else {
      console.log(`Pair - left: ${program.first().toString()}, right: ${program.rest().toString()}`);
    }
  } catch (err) {
    console.error("Error inspecting program:", err);
  }
}


const compileProgram = (source, curriedParameters = [], parameters =[], prefix = "txch") => {
    const { Clvm, toHex, Address, bytesEqual } = sdk;
    
    if (!source) throw new Error("Source code is required");
    let puzzleHash = ""; //hashed puzzle or hashed(puzzle + curried parameters)
    let conditions = null; //conditions revealed to spend
    let solution = null;  //puzzle parameters
    let cost = 0; //running to run puzzle with solution
    let compiledProgram = null;
    let errorMessage = "";
    let puzzleAddress = "";
    
    try {
        const clvm = new Clvm();
        compiledProgram = clvm.parse(source).compile();
        puzzleHash = toHex(compiledProgram.value.puzzle().puzzleHash);
        puzzleAddress = new Address(compiledProgram.value.puzzle().puzzleHash, prefix).encode();

        if (curriedParameters.length > 0) {
            let params = curriedParameters.map(p => clvm.atom(p.toAtom()));
            let programWithCurriedParameters = compiledProgram.value.curry(params);
            compiledProgram = { value: programWithCurriedParameters, cost: 0 };
            puzzleHash = toHex(programWithCurriedParameters.puzzle().puzzleHash);
            puzzleAddress = new Address(programWithCurriedParameters.puzzle().puzzleHash, prefix).encode();
        }

        // Run the program with parameters
        if (parameters.length > 0) {
            let params = clvm.list(parameters.map(p => clvm.atom(p.toAtom())));

            //console.log(params);
            let output = compiledProgram.value.run(params, 100000n, false);
            cost = output.cost;
            conditions = output.value;
        }
        else
        {
            let nil = clvm.nil();
            let output  = compiledProgram.value.run(nil, 100000n, false);
            cost = output.cost;
            conditions = output.value;
            //console.log(conditions.uncurry());
        }
    } catch (ex) {
        errorMessage = ex.toString();
        conditions = null,
        puzzleHash = "";
        compiledProgram = null;
        cost = 0;
        puzzleAddress = "";
    }
    return {
        conditions,
        compiledProgram,
        puzzleHash,
        solution,
        cost,
        errorMessage,
        puzzleAddress
    };
};

export { compileProgram };
