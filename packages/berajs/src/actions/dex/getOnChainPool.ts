import {
  balancerVaultAddress,
  bexComposableStablePoolFactoryReaderAddress,
  bexWeightedPoolFactoryAddress,
} from "@bera/config";
import { GqlPoolType } from "@bera/graphql/pol/api";
import {
  composabableStablePoolV5Abi_V2,
  vaultV2Abi,
  weightedPoolFactoryAbi_V3,
  weightedPoolV4Abi_V2,
} from "@berachain-foundation/berancer-sdk";
import { ReadContractReturnType } from "@wagmi/core";
import { Address, PublicClient, erc20Abi } from "viem";

export interface OnChainPool {
  name: string;
  poolTokens: ReadContractReturnType<typeof vaultV2Abi, "getPoolTokens">;
  totalSupply: bigint;
  swapFee: bigint;
  decimals: number;
  weights: readonly bigint[] | undefined;
  version: any;
  factory: Address;
  type: GqlPoolType;
}

export const getOnChainPool = async ({
  poolId,
  publicClient,
}: {
  poolId: string;
  publicClient: PublicClient;
}): Promise<OnChainPool> => {
  if (!publicClient) {
    throw new Error("Public client is required");
  }

  const address = poolId.slice(0, 42) as Address;

  const [
    name,
    poolTokens,
    totalSupply,
    swapFee,
    _version,
    decimals,
    isWeighted,
    isComposableStable,
  ] = await Promise.all([
    publicClient.readContract({
      address,
      abi: erc20Abi,
      functionName: "name",
    }),
    publicClient.readContract({
      address: balancerVaultAddress,
      abi: vaultV2Abi,
      functionName: "getPoolTokens",
      args: [poolId as `0x${string}`],
    }),
    publicClient.readContract({
      address,
      abi: composabableStablePoolV5Abi_V2,
      functionName: "totalSupply",
    }),
    publicClient.readContract({
      address,
      abi: weightedPoolV4Abi_V2,
      functionName: "getSwapFeePercentage",
    }),
    publicClient.readContract({
      address,
      abi: weightedPoolV4Abi_V2,
      functionName: "version",
    }),
    publicClient.readContract({
      address,
      abi: weightedPoolV4Abi_V2,
      functionName: "decimals",
    }),
    publicClient.readContract({
      address: bexComposableStablePoolFactoryReaderAddress,
      abi: weightedPoolFactoryAbi_V3,
      functionName: "isPoolFromFactory",
      args: [address],
    }),
    publicClient.readContract({
      address: bexWeightedPoolFactoryAddress,
      abi: weightedPoolFactoryAbi_V3,
      functionName: "isPoolFromFactory",
      args: [address],
    }),
  ]);

  const version = JSON.parse(_version);

  let virtualSupply: bigint | undefined;
  let weights: readonly bigint[] | undefined;

  if (isComposableStable) {
    // This returns the actual supply excluding preminted BPTs
    virtualSupply = await publicClient.readContract({
      address,
      abi: [
        {
          type: "function",
          name: "getActualSupply",
          stateMutability: "view",
          inputs: [],
          outputs: [
            {
              type: "uint256",
            },
          ],
        },
      ],
      functionName: "getActualSupply",
    });
  } else if (version.name === "WeightedPool") {
    weights = await publicClient.readContract({
      address,
      abi: weightedPoolV4Abi_V2,
      functionName: "getNormalizedWeights",
    });
  }

  if (!isComposableStable && !isWeighted) {
    throw new Error(`Pool ${address} is not a valid BEX pool`);
  }

  return {
    name,
    poolTokens,
    totalSupply: virtualSupply ?? totalSupply,
    swapFee,
    decimals,
    weights,
    version,
    factory: isComposableStable
      ? bexComposableStablePoolFactoryReaderAddress
      : bexWeightedPoolFactoryAddress,
    type: isComposableStable ? GqlPoolType.Stable : GqlPoolType.Weighted,
  };
};
