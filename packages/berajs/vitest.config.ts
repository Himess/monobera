import baseConfig from "../../vitest.shared";
import { defineProject, mergeConfig } from "vitest/config.js";
import path from "path";

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      include: ["./**/*.test.ts"],
    },
  }),
);
