import { defineWorkspace } from "vitest/config";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import vitestShared from "./vitest.shared";

export default defineWorkspace([
  {
    ...vitestShared,
    test: {
      ...vitestShared.test,
      include: ["packages/berajs/src/**/*.test.ts"],
    },
    plugins: [tsconfigPaths()],
  },
]);
