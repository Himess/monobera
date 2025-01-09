import { describe, it, expect } from "@jest/globals";
import { getAllValidators } from "./get-all-validators";

import { GetValidators } from "@bera/graphql/pol/api";

describe("getAllValidators", () => {
  it("should be defined", () => {
    expect(GetValidators).toBeDefined();
    expect(process.env.NEXT_PUBLIC_POL_SUBGRAPH_URL).toBeTruthy();
  });
});

describe("getAllValidators", () => {
  it("should return all validators", async () => {
    const validators = await getAllValidators();
    expect(validators?.validators?.validators).toBeGreaterThan(0);
  });
});
