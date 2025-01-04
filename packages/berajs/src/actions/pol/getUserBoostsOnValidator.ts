import { bgtTokenAddress } from "@bera/config";
import { GetPublicClientReturnType } from "@wagmi/core";
import { Address, formatEther } from "viem";
import { BGT_ABI } from "~/abi";
import { type BeraConfig } from "~/types";

export type UserBoostsOnValidator = {
  pubkey: Address;
  activeBoostAmount: string;
  queuedBoostAmount: string;
  queuedBoostStartBlock: number;
  queuedDropBoostAmount: string;
  queuedDropBoostStartBlock: number;
  hasPendingBoosts: boolean;
  hasActiveBoosts: boolean;
};

export const getUserBoostsOnValidator = async ({
  config,
  account,
  pubkey,
  publicClient,
}: {
  config: BeraConfig;
  account: Address;
  pubkey: Address;
  publicClient: GetPublicClientReturnType;
}): Promise<UserBoostsOnValidator> => {
  if (!account) {
    throw new Error("account is required");
  }
  if (!publicClient) {
    throw new Error("publicClient is required");
  }

  const [activeBoostAmount, queuedBoostAmount, queuedDropBoostAmount] =
    await Promise.all([
      publicClient.readContract({
        address: bgtTokenAddress,
        abi: BGT_ABI,
        functionName: "boosted",
        args: [account!, pubkey!],
      }),
      publicClient.readContract({
        address: bgtTokenAddress,
        abi: BGT_ABI,
        functionName: "boostedQueue",
        args: [account!, pubkey!],
      }),
      publicClient.readContract({
        address: bgtTokenAddress,
        abi: BGT_ABI,
        functionName: "dropBoostQueue",
        args: [account!, pubkey!],
      }),
    ]);

  return {
    pubkey,
    activeBoostAmount: formatEther(activeBoostAmount),
    queuedBoostAmount: formatEther(queuedBoostAmount[1]),
    queuedDropBoostAmount: formatEther(queuedDropBoostAmount[1]),
    queuedBoostStartBlock: queuedBoostAmount[0],
    queuedDropBoostStartBlock: queuedDropBoostAmount[0],
    hasPendingBoosts:
      Number(queuedBoostAmount[1]) > 0 || Number(queuedDropBoostAmount[1]) > 0,
    hasActiveBoosts: Number(activeBoostAmount) > 0,
  };
};
