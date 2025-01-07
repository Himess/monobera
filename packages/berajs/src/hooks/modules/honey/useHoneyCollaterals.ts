import useSWRImmutable from "swr/immutable";
import { usePublicClient } from "wagmi";

import { getHoneyCollaterals } from "~/actions/honey";
import { useBeraJs } from "~/contexts";
import { GetTokens } from "~/hooks/useTokens";
import { DefaultHookOptions, DefaultHookReturnType, Token } from "~/types";

export interface UseHoneyCollateralsResponse
  extends DefaultHookReturnType<Token[] | undefined> {}

export const useHoneyCollaterals = (
  tokenData: GetTokens | undefined,
  options?: DefaultHookOptions,
): UseHoneyCollateralsResponse => {
  const publicClient = usePublicClient();
  const method = "useHoneyTokens";
  const QUERY_KEY =
    tokenData?.tokenList && tokenData.tokenList.length > 0
      ? [method]
      : undefined;
  const { config: beraConfig } = useBeraJs();
  const config = options?.beraConfigOverride ?? beraConfig;

  const swrResponse = useSWRImmutable(
    QUERY_KEY,
    async () => {
      if (!publicClient) throw new Error("publicClient is not defined");
      if (!config) throw new Error("missing beraConfig");
      if (!tokenData || !tokenData.tokenList || !tokenData.tokenList.length)
        throw new Error("tokenData missing");
      if (!config.contracts?.honeyFactoryAddress)
        throw new Error("missing contract address honeyFactoryAddress");

      const collateralList = await getHoneyCollaterals({
        client: publicClient,
        config,
      });

      // const tokenList = await getTokens();
      const honeyTokens = tokenData.tokenList?.filter((token: Token) =>
        collateralList.includes(token.address),
      );

      // sort the tokens
      const sortedHoneyTokens = honeyTokens?.sort((a: Token, b: Token) => {
        return (
          collateralList.indexOf(a.address) - collateralList.indexOf(b.address)
        );
      });

      return sortedHoneyTokens;
    },
    {
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: () => void swrResponse.mutate(),
  };
};
