import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:5000';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.getItem.mockClear();
  sessionStorage.getItem.mockClear();
});
