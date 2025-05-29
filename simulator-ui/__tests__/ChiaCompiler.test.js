import { compileProgram } from '../src/app/ChiaCompiler'; // correct path and .js extension

import * as sdk from 'chia-wallet-sdk-wasm';

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('compiles and runs a simple with integers program', () => {
    const source = `(mod (a b) (* a b))`;
    const clvm = new Clvm();
    const paramA = clvm.int(3);
    const paramB = clvm.int(4);
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toContain("12"); // 3 * 4 = 
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('integer not same -compiles and runs a simple with integers program', () => {
    const source = `(mod (a b)
                        (if (= a b)
                            1
                            (q . "not same")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.int(3);
    const paramB = clvm.int(4);
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toContain("not same"); // 3 * 4 = 
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('integer same -compiles and runs a simple with integers program', () => {
    const source = `(mod (a b)
                        (if (= a b)
                            1
                            (q . "not same")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.int(4);
    const paramB = clvm.int(4);
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toContain("1"); // 3 * 4 = 
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('integer gt - compiles and runs a simple with integers program', () => {
    const source = `(mod (a b)
                        (if (> a b)
                            (q . "greater than")
                            (q . "not same")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.int(5);
    const paramB = clvm.int(4);
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toContain("greater than");
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('string eq - compiles and runs a simple with integers program', () => {
    const source = `(mod (a b)
                        (if (= a b)
                            (q . "same")
                            (q . "different")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.string("hello");
    const paramB = clvm.string("hello");
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toContain("different");
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('string not the same - compiles and runs a simple with integers program', () => {
    const source = `(mod (a b)
                        (if (= a b)
                            (q . "same")
                            (q . "different")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.string("hello");
    const paramB = clvm.string("THIS IS SOMETHING DIFFERENT");
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toBe("\"different\"");
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('bool not the same - compiles and runs a simple with bools program', () => {
    const source = `(mod (a b)
                        (if (= a b)
                            (q . "same")
                            (q . "different")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.bool(true);
    const paramB = clvm.bool(false);
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toBe("\"different\"");
    expect(result.errorMessage).toBe("");
  });
});

describe('ChiaCompiler', () => {
  const { Clvm } = sdk;

  it('bool eq - compiles and runs a simple with bools program', () => {
    const source = `(mod (a b)
                        (if (= a b)
                            (q . "same")
                            (q . "not same")
                        )
                    )`;
    const clvm = new Clvm();
    const paramA = clvm.bool(true);
    const paramB = clvm.bool(true);
    const result = compileProgram(source, [paramA], [paramB], 'txch');
    expect(result.conditions.unparse()).toBe("\"same\""); 
    expect(result.errorMessage).toBe("");
  });
});



//sha256
//list
