import { rewardVaultFactoryAddress } from "@bera/config";

import { Address, PublicClient, createPublicClient } from "viem";
import { UsePublicClientReturnType } from "wagmi";
import { rewardVaultAbi } from "~/abi";

export const getRewardVaultStakingToken = async ({
  address,
  publicClient,
}: {
  address: Address;
  publicClient: NonNullable<UsePublicClientReturnType | PublicClient>;
}) => {
  const vaultAddress = await publicClient.readContract({
    address: address,
    abi: rewardVaultAbi,
    functionName: "stakeToken",
  });

  return vaultAddress;
};
