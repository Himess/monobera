import { getServerSidePublicClient } from "../../utils/getServerSideClient";
import { getOnChainPool } from "./getOnChainPool";
import { describe, it, expect } from "vitest";

describe("getOnChainPool", () => {
  it("should be defined", () => {
    expect(process.env.NEXT_PUBLIC_POL_SUBGRAPH_URL).toBeTruthy();
  });
  it("should return the on chain pool", async () => {
    const invalidPoolPromise = getOnChainPool({
      poolId:
        "0x4e7ab786f93737026711ab3165aac911746b6613000000000000000000000011",
      publicClient: getServerSidePublicClient(),
    });
    expect(invalidPoolPromise).rejects.toThrowError();
  });
});
