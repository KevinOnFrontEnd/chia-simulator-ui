import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tsconfig = JSON.parse(readFileSync(new URL('./tsconfig.json', import.meta.url)));

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node', // Custom Node env
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
transform: {
  '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  '^.+\\.js$': ['babel-jest', { configFile: './babel.jest.config.js' }],
  '^.+\\.wasm$': 'jest-transform-stub',
},
  transformIgnorePatterns: [
    '/node_modules/(?!chia-wallet-sdk-wasm).+\\.js$',
  ],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'wasm'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
