import * as sdk from 'chia-wallet-sdk-wasm';


describe("Compile program source with chia-wallet-sdk", () => {
  const { Clvm, toHex, Address, fromHex } = sdk;
  const clvm = new Clvm();
  it("Simple multiply returns result", async () => {
    const program = clvm.parse(`
              (mod (A B)
                (defun multiply (X Y)
                  (* X Y)
                )
                (multiply A B)
              )
            `);
    const compiled = program.compile();
    const i1 = BigInt(6);
    const i2 = BigInt(10);
    const p1 = clvm.int(i1);
    const p2 = clvm.int(i2);
    const curriedProgram = compiled.value.curry([p1]);
    const i3 = BigInt(100000000);

    const programList = clvm.list([p2]);
      const output2 = curriedProgram.run(programList, i3, false);
    expect(output2.value.unparse()).toBe("60");
  });

  it("creates a coin if provided address matches the curried address", async () => {
    // ✅ Fixed Chia address
    const randomAddress = "xch1tjn74nc5ggmyex4wtjdvxs5xhxf408nndzhzn8vvkummmnw84nysy54qzh";
    const randomAddress2 = "xch1krh884ya3fayx4nulh7lw6224hxaqffcuatqmctz3hv4c89cdjmq99lj3m";
    console.log("Fixed Address:", randomAddress);

    // ✅ Puzzle: if param matches curried address, create coin using opcode 51
    const puzzleSource = `
      (mod (expected_addr given_addr amount)
        (if (= expected_addr given_addr)
          (list
              (list 51 expected_addr amount)
          )
          (x (q . "Address mismatch"))
        )
      )
    `;

    // ✅ Compile puzzle
    const program = clvm.parse(puzzleSource);
    const compiled = program.compile();

    // ✅ Curry fixed address puzzle hash as atom
    const expectedAddrBytes = Address.decode(randomAddress).puzzleHash; // Uint8Array
       const expectedAddrBytes2 = Address.decode(randomAddress2).puzzleHash;
    const curriedProgram = compiled.value.curry([clvm.atom(expectedAddrBytes)]);

    // ✅ Provide matching puzzle hash and amount
    const givenAddrProgram = clvm.atom(expectedAddrBytes); // matching address
    const amountProgram = clvm.int(BigInt(1000)); // amount
    const solutionArgs = clvm.list([givenAddrProgram, amountProgram]);


    // ✅ Run program
    const output = curriedProgram.run(solutionArgs, BigInt(1_000_000), false);
    console.log(dumpCLVMTree(output.value));
  });




function dumpCLVMTree(program: sdk.Program): string {
  if (program.isPair()) {
    const left = dumpCLVMTree(program.first());
    const right = dumpCLVMTree(program.rest());
    return `(${left} ${right})`;
  } else {
    const bytes = program.toAtom();

    if (bytes.length === 0) {
      return "()"; // Nil
    }

    // Small atoms → render as numbers
    if (bytes.length <= 4) {
      const num = BigInt("0x" + toHex(bytes));
      return num.toString();
    }

    // All other atoms → hex
    return "0x" + toHex(bytes);
  }
}

});
