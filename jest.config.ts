export default {
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
    // exclude  b-sdk
    "!**/b-sdk/**",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testEnvironment: "node",
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/.scripts/setupJest.ts"],

  projects: [
    {
      displayName: "berajs",
      roots: ["<rootDir>/packages/berajs/src"],
      setupFilesAfterEnv: ["dotenv/config", "cross-fetch/polyfill"],

      testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
      ],
      transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
      },
      moduleNameMapper: {
        "@bera/config": "<rootDir>/packages/config/env",
        "^@bera/graphql/(.*)/(.*)":
          "<rootDir>/packages/graphql/src/modules/$1/$2.codegen.ts",
        "@bera/graphql": "<rootDir>/packages/graphql/src",
        "@bera/berajs": "<rootDir>/packages/berajs/src",
      },
    },
  ],
};
