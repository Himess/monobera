import { useMemo } from "react";
import {
  useMultipleTokenInformation,
  useSubgraphTokenInformations,
} from "@bera/berajs";
import { SubgraphPoolFragment } from "@bera/graphql/dex/subgraph";
import useSWRImmutable from "swr/immutable";
import { Address, erc20Abi, formatEther, formatUnits, isAddress } from "viem";
import { usePublicClient } from "wagmi";
import { getOnChainPool } from "@bera/berajs/actions";

export function useOnChainPoolData(poolId: string) {
  const address = poolId.slice(0, 42) as Address;
  const publicClient = usePublicClient();

  const isAddressValid = isAddress(address);

  const isValid = isAddressValid && !!publicClient;

  const {
    data: poolData,
    error,
    isLoading,
  } = useSWRImmutable(
    isValid && !!poolId && publicClient
      ? ["useOnChainPoolData", "tokenAddresses", poolId]
      : null,
    async () => {
      return getOnChainPool({
        poolId,
        // @ts-expect-error viem types
        publicClient,
      });
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
