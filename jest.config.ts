import type { Config } from 'jest';
 
const config: Config = {
  // Use the ts-jest preset for ESM
  preset: 'ts-jest/presets/default-esm',
 
  // Ensure Jest runs in a Node.js environment
  testEnvironment: 'node',
  
  // Only specify .ts, as .js is already handled by package.json
  extensionsToTreatAsEsm: ['.ts'],
 
  // This is a crucial mapping to resolve imported modules correctly
  moduleNameMapper: {
    // Map .js imports to .ts files for testing
    '^(\\.\\.?\\/.+)\\.js$': '$1',
    // Handle absolute imports if needed
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Ignore dist and node_modules
  testPathIgnorePatterns: ["dist/", "node_modules/"],
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
        target: 'es2020'
      }
    }]
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/test-setup.ts'
  ]
};
 
export default config;
 