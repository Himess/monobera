import { beforeAll } from "@jest/globals";

import dotenv from "dotenv";
import path from "path";
import "cross-fetch/polyfill";

beforeAll(() => {
  dotenv.config({
    path: path.join(__dirname, "../.env"),
  });
});
