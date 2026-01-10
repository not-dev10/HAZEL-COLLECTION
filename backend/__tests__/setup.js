// Jest setup file for backend tests
// Configure environment variables
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/didi_fashion_test';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Suppress console logs during tests (comment out if you need debug output)
// global.console = {
//   log: jest.fn(),
//   error: console.error,
//   warn: console.warn,
//   info: jest.fn(),
//   debug: jest.fn(),
// };
