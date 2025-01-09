import { rewardVaultFactoryAddress } from "@bera/config";

import { Address, PublicClient } from "viem";
import { rewardVaultFactoryAbi } from "~/abi";

export const getRewardVaultFromToken = async ({
  tokenAddress,
  publicClient,
  factoryAddress = rewardVaultFactoryAddress,
}: {
  tokenAddress: Address;
  publicClient: PublicClient;
  factoryAddress?: Address;
}) => {
  const vaultAddress = await publicClient.readContract({
    address: factoryAddress,
    abi: rewardVaultFactoryAbi,
    functionName: "getVault",
    args: [tokenAddress],
  });

  return vaultAddress;
};
