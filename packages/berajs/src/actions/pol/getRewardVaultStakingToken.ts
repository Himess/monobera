import { rewardVaultFactoryAddress } from "@bera/config";

import { Address, PublicClient, createPublicClient } from "viem";
import { UsePublicClientReturnType } from "wagmi";
import { BERA_VAULT_REWARDS_ABI } from "~/abi";

export const getRewardVaultStakingToken = async ({
  address,
  publicClient,
}: {
  address: Address;
  publicClient: NonNullable<UsePublicClientReturnType | PublicClient>;
}) => {
  const vaultAddress = await publicClient.readContract({
    address: address,
    abi: BERA_VAULT_REWARDS_ABI,
    functionName: "stakeToken",
  });

  return vaultAddress;
};
