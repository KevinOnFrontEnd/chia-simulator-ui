const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // change to 'jsdom' if you test React components later
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
};
