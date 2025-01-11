import { balancerApiChainName } from "@bera/config";
import { bexApiGraphqlClient } from "@bera/graphql";
import {
  GetPool,
  GetPoolQuery,
  GetPoolQueryVariables,
} from "@bera/graphql/dex/api";
import { GqlChain } from "@bera/graphql/pol/api";
import { describe, expect, it } from "vitest";
import { getRewardVault, getRewardVaults } from "~/actions/pol";

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

describe("getRewardVaults", async () => {
  const wberaHoneyVault = await getRewardVault(
    "0x0cc03066a3a06f3ac68d3a0d36610f52f7c20877",
  );

  const pool = await bexApiGraphqlClient.query<
    GetPoolQuery,
    GetPoolQueryVariables
  >({
    query: GetPool,
    variables: {
      id: "0x3ad1699779ef2c5a4600e649484402dfbd3c503c000200000000000000000004",
      chain: balancerApiChainName as GqlChain,
    },
  });

  console.log(pool);

  it("should return vaults", async () => {
    const result = await getRewardVaults({});
    expect(result).toBeDefined();
  });
});
