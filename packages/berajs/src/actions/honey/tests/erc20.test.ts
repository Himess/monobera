import { honeyAddress, honeyFactoryAddress } from "@bera/config";
import { Address, encodeFunctionData, erc20Abi, formatUnits } from "viem";
import { describe, it, expect } from "vitest";
import { getTokenInformation } from "~/actions/dex";
import { getServerSidePublicClient } from "~/utils/getServerSideClient";

describe("honey", () => {
  it("returns public client", () => {
    const publicClient = getServerSidePublicClient();
    expect(publicClient).toBeDefined();
  });

  it("should have abi", () => {
    expect(erc20Abi).toBeDefined();
  });
});

describe.each<Address>([
  "0x015fd589F4f1A33ce4487E12714e1B15129c9329",
  "0x164A2dE1bc5dc56F329909F7c97Bae929CaE557B",
])("erc20", async (tokenAddress) => {
  const publicClient = getServerSidePublicClient();

  const tokenInfo = await getTokenInformation({
    address: tokenAddress,
    publicClient,
  });
  console.group(tokenInfo?.name);
  it("returns token info", async () => {
    expect(honeyAddress).toBeDefined();
    expect(tokenInfo).toBeDefined();
  });

  it("returns approvals of wallet $1", async () => {
    const walletAddress = "0x4C368fFE3650379d6318C8d4630bc51f8Ad12bB6";

    expect(walletAddress).toBeDefined();
    expect(honeyFactoryAddress).toBeDefined();

    const approvals = await publicClient.readContract({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "allowance",
      args: [walletAddress, honeyFactoryAddress],
    });

    expect(Number(approvals)).toBeDefined();

    // const data = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: "approve",
    //   args: [honeyFactoryAddress, 0n],
    // });

    // expect(data).toBeDefined();
  });

  console.groupEnd();
});
