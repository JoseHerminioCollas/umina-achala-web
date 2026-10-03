export default {
  preset: "ts-jest/presets/default-esm", // ESM + TS
  testEnvironment: "node", // component tests opt in with `@jest-environment jsdom`
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.css$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.jsx?$": "babel-jest",
  },
};
