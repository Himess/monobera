import { describe, expect, it } from "vitest";
import { getRewardVaults } from "~/actions/bgt";

describe("rewardVaults", async () => {
  const result = await getRewardVaults({});

  if (!result) {
    throw new Error("Failed to fetch vaults");
  }

  const { gaugeList } = result;

  it("should return vaults", () => {
    expect(gaugeList.length).toBeGreaterThan(0);
  });

  it("should have consistent data", () => {
    const totalBgtCatpure = gaugeList.reduce(
      (acc, vault) =>
        acc + Number(vault.dynamicData?.bgtCapturePercentage ?? 0),
      0,
    );
    expect(totalBgtCatpure).toBeCloseTo(100, 9);
  });
});
