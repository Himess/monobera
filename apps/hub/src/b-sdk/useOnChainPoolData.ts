import { useEffect, useMemo, useState } from "react";
import {
  useMultipleTokenInformation,
  useSubgraphTokenInformations,
} from "@bera/berajs";
import {
  balancerVaultAddress,
  bexComposableStablePoolFactoryReaderAddress,
  bexWeightedPoolFactoryAddress,
} from "@bera/config";
import { GqlPoolType } from "@bera/graphql/dex/api";
import { SubgraphPoolFragment } from "@bera/graphql/dex/subgraph";
import {
  composabableStablePoolV5Abi_V2,
  vaultV2Abi,
  weightedPoolFactoryAbi_V3,
  weightedPoolV4Abi_V2,
} from "@berachain-foundation/berancer-sdk";
import useSWRImmutable from "swr/immutable";
import { Address, erc20Abi, formatEther, formatUnits, isAddress } from "viem";
import { usePublicClient } from "wagmi";

export function useOnChainPoolData(poolId: string) {
  const address = poolId.slice(0, 42) as Address;
  const publicClient = usePublicClient();

  const isAddressValid = isAddress(address);

  const isValid = isAddressValid && !!publicClient;

  const {
    data: poolData,
    error,
    isLoading,
    isValidating,
  } = useSWRImmutable(
    isValid ? ["useOnChainPoolData", "tokenAddresses", poolId] : null,
    async () => {
      if (!publicClient) return undefined;

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

      let virtualSupply, weights;

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
    },
  );

  const { data: tokenInformation, isLoading: isTokenInformationLoading } =
    useMultipleTokenInformation({
      addresses: poolData?.poolTokens[0] ?? [],
    });

  const { data: tokenPrices, isLoading: isTokenPricesLoading } =
    useSubgraphTokenInformations({
      tokenAddresses: poolData?.poolTokens[0] as Address[] | undefined,
    });

  const pool = useMemo(() => {
    if (!poolData || !tokenInformation) {
      return undefined;
    }

    const pool: SubgraphPoolFragment = {
      address: address.toLowerCase(),
      id: poolId.toLowerCase(),
      type: poolData.type,
      factory: poolData.factory,
      totalShares: formatUnits(poolData.totalSupply, poolData.decimals),
      totalLiquidity: undefined,
      swapFee: formatEther(poolData.swapFee),
      createTime: 0,
      name: poolData.name,
      tokens: tokenInformation.map((token, idx) => ({
        address: token.address.toLowerCase(),
        name: token.name,
        decimals: token.decimals,
        symbol: token.symbol,
        index: idx,
        weight: poolData.weights
          ? formatEther(poolData.weights.at(idx) ?? 0n)
          : undefined,
        balance: formatUnits(poolData.poolTokens[1][idx], token.decimals),
        token: {
          __typename: "Token",
          token,
          latestUSDPrice: tokenPrices?.[token.address],
        },
      })),
    };

    const totalLiquidity = pool.tokens?.reduce((acc, token) => {
      if (!token.token.latestUSDPrice) return acc;
      return acc + Number(token.token.latestUSDPrice) * Number(token.balance);
    }, 0);

    pool.totalLiquidity = totalLiquidity;

    return pool;
  }, [poolData, tokenInformation, tokenPrices]);

  return {
    data: pool,
    error,
    isLoading: isLoading || isTokenInformationLoading || isTokenPricesLoading,
  };
}
