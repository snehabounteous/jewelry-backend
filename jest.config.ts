/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use the ts-jest preset for ESM
  preset: 'ts-jest/presets/default-esm',

  // Ensure Jest runs in a Node.js environment
  testEnvironment: 'node',
  
  // Only specify .ts, as .js is already handled by package.json
  extensionsToTreatAsEsm: ['.ts'],

  // This is a crucial mapping to resolve imported modules correctly
  moduleNameMapper: {
    '^(\\.\\.?\\/.+)\\.js$': '$1',
  },
};