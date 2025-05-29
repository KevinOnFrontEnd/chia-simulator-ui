import { compileProgram } from '../src/app/ChiaCompiler'; // correct path and .js extension

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


describe('clvm', () => {
  const { Clvm, sha256, toHex } = sdk;

  it('clvm direct sha256 eq - compiles and runs a program comparing SHA256 values', () => {
    const source = `(mod (a b)
                          (if (= a b)
                              (q . "same")
                              (q . "different")
                          )
                      )`;

    const clvm = new Clvm();

    const originalValue = "chia";
    const originalValue2 = "chia";
    const hashBytes = sha256(clvm.string(originalValue).toAtom());
    const hashBytes2 = sha256(clvm.string(originalValue2).toAtom());
    const hashAtom1 = clvm.atom(hashBytes)
    const hashAtom2 = clvm.atom(hashBytes2);
    const parms = [hashAtom1, hashAtom2];
    const p1 = clvm.list(parms);
    const compiledProgram = clvm.parse(source).compile();
     const output =   compiledProgram.value.run(p1, 100000n, false);
     expect(output.value.unparse()).toBe("\"same\"");
  });
});

describe('clvm', () => {
  const { Clvm, sha256, Program } = sdk;

  it('clvm direct sha256 equal currying', () => {
    const source = `(mod (a b)
                          (if (= a b)
                              (q . "same")
                              (q . "different")
                          )
                      )`;

    const clvm = new Clvm();

    const originalValue = "chia";
    const originalValue2 = "chia";

    const hashBytes1 = sha256(clvm.string(originalValue).toAtom());
    const hashBytes2 = sha256(clvm.string(originalValue2).toAtom());

    const hashAtom1 = clvm.atom(hashBytes1);
    const hashAtom2 = clvm.atom(hashBytes2);

    const compiled = clvm.parse(source).compile().value;
    const curried = compiled.curry([hashAtom1]);

    const paramList = clvm.list([hashAtom2]);

    const result = curried.run(paramList, 100000n, false);
    expect(result.value.unparse()).toBe('"same"');
  });
});

describe('clvm', () => {
  const { Clvm, sha256, Program } = sdk;

  it('string equal currying', () => {
    const source = `(mod (a b)
                          (if (= a b)
                              (q . "same")
                              (q . "different")
                          )
                      )`;

    const clvm = new Clvm();

    const originalValue = "chia";
    const originalValue2 = "chia";

    const hashBytes1 = clvm.string(originalValue).toAtom();
    const hashBytes2 = clvm.string(originalValue2).toAtom();

    const hashAtom1 = clvm.atom(hashBytes1);
    const hashAtom2 = clvm.atom(hashBytes2);

    const compiled = clvm.parse(source).compile().value;
    var a1 = [hashAtom1];
    a1.forEach((item, index) => {
  console.log(`Element ${index}: typeof = ${typeof item}, constructor = ${item?.constructor?.name}`);
      console.log(item.toString())
});


    const curried = compiled.curry(a1);

    const paramList = clvm.list([hashAtom2]);

    const result = curried.run(paramList, 100000n, false);
    expect(result.value.unparse()).toBe('"same"');
  });
});

//sha256
//list
