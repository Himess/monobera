import { ApiVaultFragment } from "@bera/graphql/pol/api";
import useSWR, { mutate } from "swr";
import { Address } from "viem";

import { getRewardVault } from "~/actions";
import { DefaultHookOptions, DefaultHookReturnType } from "~/types";

export interface UsePollValidatorInfoResponse
  extends DefaultHookReturnType<ApiVaultFragment> {}

export const useRewardVaultQueryKey = (address: Address | undefined) =>
  address ? ["useRewardVault", address.toLowerCase()] : null;

export const useRewardVault = (
  id: Address | undefined,
  options?: DefaultHookOptions,
): UsePollValidatorInfoResponse => {
  const QUERY_KEY = useRewardVaultQueryKey(id);

  const swrResponse = useSWR<ApiVaultFragment, any, typeof QUERY_KEY>(
    QUERY_KEY,
    async () => {
      if (!id) throw new Error("Invalid address");
      return await getRewardVault(id);
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
