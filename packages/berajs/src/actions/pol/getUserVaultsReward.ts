import { Address, PublicClient } from "viem";

import { rewardVaultAbi } from "~/abi";

export interface GetUserVaultsInfo {
  account: string | undefined;
  vaultAddress: Address;
  publicClient: PublicClient | undefined;
}

export const getUserVaultsReward = async ({
  account,
  vaultAddress,
  publicClient,
}: GetUserVaultsInfo): Promise<bigint> => {
  if (!publicClient) throw new Error("Missing public client");
  if (!account) throw new Error("Missing user account");
  if (!vaultAddress) throw new Error("Missing vault address");

  return await publicClient.readContract({
    address: vaultAddress,
    abi: rewardVaultAbi,
    functionName: "earned",
    args: [account as `0x${string}`],
  });
};
