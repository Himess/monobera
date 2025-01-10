import useSWR from "swr";

import { getRewardVaults } from "~/actions/pol/getRewardVaults";
import { DefaultHookOptions, useBeraJs } from "../../..";
import { GetVaultsQueryVariables } from "@bera/graphql/pol/api";

export const useRewardVaultsQueryKey = (filter?: GetVaultsQueryVariables) => {
  return ["useRewardVaults", filter];
};

export const useRewardVaults = (
  filter?: GetVaultsQueryVariables,
  options?: DefaultHookOptions,
) => {
  const QUERY_KEY = useRewardVaultsQueryKey(filter);
  const swrResponse = useSWR(
    QUERY_KEY,
    async () => {
      return await getRewardVaults({ filter });
    },
    {
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: swrResponse.mutate,
  };
};
