import useSWRImmutable from "swr/immutable";
import { getAddress, type Address } from "viem";
import { usePublicClient } from "wagmi";

import {
  CollateralRates,
  CollateralRatesMap,
  getCollateralRates,
} from "~/actions/honey";
import { useBeraJs } from "~/contexts";
import { DefaultHookOptions, DefaultHookReturnType, Token } from "~/types";

export interface UseCollateralsRatesResponse
  extends DefaultHookReturnType<CollateralRatesMap | undefined> {
  getCollateralRate: (
    collateral: string,
    isBasketMode: boolean,
  ) => CollateralRates | undefined;
}

export const useCollateralsRates = (
  { collateralList }: { collateralList?: Token[] },
  options?: DefaultHookOptions,
): UseCollateralsRatesResponse => {
  const publicClient = usePublicClient();
  const method = "useCollateralsRates";
  const QUERY_KEY = collateralList ? [method, ...collateralList] : null;
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;

  const swrResponse = useSWRImmutable(
    QUERY_KEY,
    async () => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!config) throw new Error("missing beraConfig");
      if (!config.contracts?.honeyFactoryAddress)
        throw new Error("missing contract address honeyFactoryAddress");
      if (!config.contracts?.multicallAddress)
        throw new Error("missing contract address multicallAddress");
      if (!collateralList) throw new Error("missing collateralList");

      return await getCollateralRates({
        client: publicClient,
        config,
        collateralList,
      });
    },
    { ...options?.opts },
  );

  const getCollateralRate = (
    collateral: string,
    isBasketMode: boolean,
  ): CollateralRates | undefined =>
    isBasketMode
      ? swrResponse.data?.basket
      : swrResponse.data?.single[getAddress(collateral)];

  return {
    ...swrResponse,
    refresh: () => void swrResponse.mutate(),
    getCollateralRate,
  };
};
