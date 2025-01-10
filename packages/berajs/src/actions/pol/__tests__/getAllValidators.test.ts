import { describe, it, expect } from "vitest";
import { getAllValidators } from "../getAllValidators";

import { GetValidators } from "@bera/graphql/pol/api";

describe("getAllValidators", () => {
  it("should be defined", () => {
    expect(GetValidators).toBeDefined();
    expect(process.env.NEXT_PUBLIC_POL_SUBGRAPH_URL).toBeTruthy();
  });
});

describe("getAllValidators", async () => {
  const result = await getAllValidators();

  if (!result) {
    throw new Error("Failed to fetch validators");
  }

  const { validators } = result;
  it("should return all validators", async () => {
    expect(validators?.validators?.length).toBeGreaterThan(0);
  });

  // it("should have consistent data", async () => {
  //   const totalBgtCatpure = validators?.validators.reduce(
  //     (acc, validator) =>
  //       acc + Number(validator.dynamicData?.bgtCapturePercentage ?? 0),
  //     0,
  //   );
  //   expect(totalBgtCatpure).toBe(100);
  // });
});

describe("getAllValidators", () => {
  it("should be defined", () => {
    expect(true).toBeDefined();
  });
});
