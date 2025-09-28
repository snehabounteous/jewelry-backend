// Test setup file for Jest
// This file runs before each test suite
 
// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_1ZnQpkeTju5V@ep-steep-bonus-a12adhvl.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
process.env.NODE_ENV = 'test';

// Global test configuration
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};