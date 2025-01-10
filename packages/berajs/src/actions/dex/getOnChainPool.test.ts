import { getServerSidePublicClient } from "../../utils/getServerSideClient";
import { getOnChainPool } from "./getOnChainPool";
import { describe, it, expect } from "@jest/globals";

describe("getOnChainPool", () => {
  it("should return the on chain pool", async () => {
    const invalidPoolPromise = getOnChainPool({
      poolId:
        "0x4e7ab786f93737026711ab3165aac911746b6613000000000000000000000011",
      publicClient: getServerSidePublicClient(),
    });
    expect(invalidPoolPromise).toThrowError();
  });
});
