export default {
  preset: "ts-jest/presets/default-esm", // ESM + TS
  testEnvironment: "node", // component tests opt in with `@jest-environment jsdom`
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/__tests__/mocks/",
    "<rootDir>/__tests__/fixtures/",
  ],
  moduleNameMapper: {
    "\\.css$": "identity-obj-proxy",
    // import.meta.env is Vite's; tests run with no VITE_ variables set
    "^(\\.{1,2}/)+env$": "<rootDir>/__tests__/mocks/env.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.jsx?$": "babel-jest",
  },
};
