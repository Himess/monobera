import useSWR from "swr";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

import { getGlobalCapLimit } from "~/actions/honey/getGlobalCapLimit";
import { useBeraJs } from "~/contexts";
import POLLING from "~/enum/polling";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types";

export interface UseCappedGloballyResponse
  extends DefaultHookReturnType<boolean | undefined> {}

export const useCappedGlobally = (
  asset: Address | undefined,
  amount: string | undefined,
  isMint: boolean,
  isBasketModeEnabled: boolean | undefined,
  options?: DefaultHookOptions,
): UseCappedGloballyResponse => {
  const publicClient = usePublicClient();
  const method = "getGlobalCapLimit";
  const QUERY_KEY = amount && asset ? [method, amount, asset] : undefined;
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;

  const swrResponse = useSWR(
    QUERY_KEY,
    async () => {
      if (isBasketModeEnabled) {
        return false;
      }
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!config) throw new Error("missing beraConfig");
      if (!amount) throw new Error("missing amount");
      if (!asset) throw new Error("missing asset");
      if (!config.contracts?.honeyFactoryAddress)
        throw new Error("missing contract address honeyFactoryAddress");

      return await getGlobalCapLimit({
        client: publicClient,
        config,
        asset,
        amount: isMint ? amount : `-${amount}`,
      });
    },
    {
      ...options?.opts,
      refreshInterval: 0,
    },
  );

  return {
    ...swrResponse,
    refresh: () => void swrResponse.mutate(),
  };
};
