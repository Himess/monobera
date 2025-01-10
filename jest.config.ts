/**
 * @type {import('jest').Config}
 */
export default {
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
    // exclude  b-sdk
    "!**/b-sdk/**",
  ],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  testEnvironment: "jsdom",
  preset: "ts-jest",

  setupFilesAfterEnv: ["<rootDir>/.scripts/setupJest.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!wagmi)"],
  projects: [
    {
      displayName: "berajs",
      roots: ["<rootDir>/packages/berajs/src"],
      setupFilesAfterEnv: ["dotenv/config", "cross-fetch/polyfill"],

      transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
      },

      transformIgnorePatterns: ["<rootDir>/node_modules/(?!wagmi)"],

      moduleNameMapper: {
        "@bera/config": "<rootDir>/packages/config/env",
        "^@bera/graphql/(.*)/(.*)":
          "<rootDir>/packages/graphql/src/modules/$1/$2.codegen.ts",
        "@bera/graphql": "<rootDir>/packages/graphql/src",
        "@bera/wagmi": "<rootDir>/packages/wagmi/src",
        "^@bera/wagmi/(.*)$": "<rootDir>/packages/wagmi/src/$1",
        "@bera/berajs": "<rootDir>/packages/berajs/src",
      },
      testEnvironment: "jsdom",
      preset: "ts-jest",
    },
  ],
};
