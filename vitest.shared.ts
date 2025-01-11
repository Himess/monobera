import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["dotenv/config"],
    globals: true,
  },

  resolve: {
    alias: [
      {
        find: "@bera/config",
        replacement: path.resolve(__dirname, "packages/config/env"),
      },
      {
        find: "@berachain-foundation/berancer-sdk",
        replacement: path.resolve(__dirname, "packages/b-sdk/src"),
      },
    ],
  },
});
