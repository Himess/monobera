import useSWR from "swr";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

import { getHoneyCollaterals } from "~/actions";
import { getRelativeCapLimit } from "~/actions/honey/getRelativeCapLimit";
import { useBeraJs } from "~/contexts";
import { DefaultHookOptions, DefaultHookReturnType, Token } from "~/types";

export interface UseCappedRelativelyResponse
  extends DefaultHookReturnType<boolean | undefined> {}

export const useCappedRelatively = (
  asset: Address | undefined,
  amount: string | undefined,
  isMint: boolean,
  isBasketModeEnabled: boolean | undefined,
  options?: DefaultHookOptions,
): UseCappedRelativelyResponse => {
  const publicClient = usePublicClient();
  const method = "getRelativeCapLimit";
  const QUERY_KEY = asset && amount ? [method, asset, amount] : undefined;
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
      if (!asset) throw new Error("missing asset");
      if (!amount) throw new Error("missing amount");
      if (!config.contracts?.honeyFactoryAddress)
        throw new Error("missing contract address honeyFactoryAddress");

      if (!isMint) {
        const newAmount = `-${amount}`;
        const { collaterals, referenceCollateral } = await getHoneyCollaterals({
          client: publicClient,
          config,
        });

        if (referenceCollateral === asset) {
          for (const collateral of collaterals) {
            if (collateral === asset) {
              continue;
            }
            const isCapped = await getRelativeCapLimit({
              client: publicClient,
              config,
              asset: collateral,
              amount: newAmount,
              isMint,
            });
            if (isCapped) {
              return true;
            }
          }
        }
        return false;
      }

      return await getRelativeCapLimit({
        client: publicClient,
        config,
        asset,
        amount,
        isMint,
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
