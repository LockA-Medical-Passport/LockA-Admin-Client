import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  collectCoverageFrom: [
    "src/components/ui/**/*.{ts,tsx}",
    "!src/components/ui/**/*.stories.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/node_modules.bak/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
  ],
  modulePathIgnorePatterns: ["<rootDir>/node_modules.bak/"],
  watchPathIgnorePatterns: ["<rootDir>/node_modules.bak/"],
};

export default createJestConfig(config);
