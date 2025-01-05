import { balancerApiChainName } from "@bera/config";
import { bexApiGraphqlClient } from "@bera/graphql";
import {
  ApiValidatorFragment,
  GetValidator,
  GetValidatorQuery,
  GetValidatorQueryVariables,
  GqlChain,
} from "@bera/graphql/pol/api";
import useSWR, { mutate } from "swr";
import { Address } from "viem";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types";

export interface UsePollValidatorInfoResponse
  extends DefaultHookReturnType<ApiValidatorFragment | null> {}

export const useSelectedValidator = (
  id: Address,
  options?: DefaultHookOptions,
): UsePollValidatorInfoResponse => {
  const QUERY_KEY = id ? ["useSelectedValidator", id] : null;
  const swrResponse = useSWR<
    ApiValidatorFragment | null,
    any,
    typeof QUERY_KEY
  >(
    QUERY_KEY,
    async () => {
      if (!id) throw new Error("Invalid address");

      const results = await bexApiGraphqlClient.query<
        GetValidatorQuery,
        GetValidatorQueryVariables
      >({
        query: GetValidator,
        variables: {
          id,
          chain: balancerApiChainName as GqlChain,
        },
      });

      return results.data?.validator ?? null;
    },
    {
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: () => mutate(QUERY_KEY),
  };
};
