import useSWR from "swr";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

import { getCollateralWeights } from "~/actions/honey";
import { useBeraJs } from "~/contexts";
import POLLING from "~/enum/polling";
import { DefaultHookOptions, DefaultHookReturnType, Token } from "~/types";

export interface UseCollateralWeightsResponse
  extends DefaultHookReturnType<Record<Address, bigint> | undefined> {}

export const useCollateralWeights = (
  collateralList: Token[] | undefined,
  options?: DefaultHookOptions,
): UseCollateralWeightsResponse => {
  const publicClient = usePublicClient();
  const method = "getWeights";
  const QUERY_KEY = collateralList ? [method] : undefined;
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;

  const swrResponse = useSWR(
    QUERY_KEY,
    async () => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!config) throw new Error("missing beraConfig");
      if (!collateralList) throw new Error("missing collateralList");
      if (!config.contracts?.honeyFactoryAddress)
        throw new Error("missing contract address honeyFactoryAddress");

      return await getCollateralWeights({
        client: publicClient,
        config,
        collateralList,
      });
    },
    {
      ...options?.opts,
      refreshInterval: options?.opts?.refreshInterval ?? POLLING.NORMAL,
    },
  );

  return {
    ...swrResponse,
    refresh: () => void swrResponse.mutate(),
  };
};
