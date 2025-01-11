import useSWR, { mutate } from "swr";

import { getSubgraphHoneyPrice } from "~/actions/honey";
import POLLING from "~/enum/polling";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types/global";
import {
  handleNativeBera,
  useBeraJs,
  useTokenCurrentPrices,
  wBeraToken,
} from "../..";
import { useEffect, useState } from "react";
import { beraTokenAddress, bgtTokenAddress } from "@bera/config";
import { isAddressEqual } from "viem";

/**
 *
 * @returns the current honey price of a given token
 */

export type UseTokenHoneyPriceArgs = {
  tokenAddress: `0x${string}` | undefined;
};

/**
 * This either fetches the price from the subgraph or uses the price from the backend
 * token current prices.
 */
export const useTokenHoneyPrice = (
  args: UseTokenHoneyPriceArgs,
  options?: DefaultHookOptions,
): DefaultHookReturnType<string | undefined> => {
  const {
    data: allPrices,
    isLoading: allPricesLoading,
    refresh: allPricesRefresh,
    isValidating: allPricesValidating,
  } = useTokenCurrentPrices();
  const { config: beraConfig } = useBeraJs();

  const tokenAddress = handleNativeBera(args.tokenAddress);

  const tokenHoneyPrice =
    allPrices?.[
      isAddressEqual(tokenAddress, bgtTokenAddress)
        ? beraTokenAddress
        : handleNativeBera(args.tokenAddress).toLowerCase()
    ]?.price?.toString();

  const QUERY_KEY =
    !tokenHoneyPrice && !allPricesLoading
      ? ["useTokenHoneyPrice", tokenAddress]
      : null;

  const swrResponse = useSWR<string | undefined>(
    QUERY_KEY,
    async () => {
      return getSubgraphHoneyPrice({
        tokenAddress: args.tokenAddress,
        config: options?.beraConfigOverride ?? beraConfig,
      });
    },
    {
      ...options,
      refreshInterval: options?.opts?.refreshInterval ?? POLLING.FAST,
    },
  );

  return {
    ...swrResponse,
    isLoading: allPricesLoading || swrResponse.isLoading,
    isValidating: allPricesValidating || swrResponse.isValidating,
    data: tokenHoneyPrice ? tokenHoneyPrice.toString() : swrResponse.data,
    refresh: () => swrResponse?.mutate?.(),
  };
};
