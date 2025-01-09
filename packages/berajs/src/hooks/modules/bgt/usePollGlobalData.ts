import useSWR from "swr";
import { usePublicClient } from "wagmi";
import { DefaultHookOptions, DefaultHookReturnType, useBeraJs } from "../../..";
import { GlobalData, getGlobalData } from "~/actions/bgt/getGlobalData";

export const usePollGlobalDataQueryKey = () => "usePollGlobalData";
export const usePollGlobalData = (
  options?: DefaultHookOptions,
): DefaultHookReturnType<GlobalData> => {
  const publicClient = usePublicClient();
  const { config: beraConfig } = useBeraJs();

  const config = options?.beraConfigOverride ?? beraConfig;

  const swrResponse = useSWR<GlobalData>(
    publicClient ? usePollGlobalDataQueryKey() : null,
    async () => getGlobalData(publicClient!, config),
    {
      revalidateOnFocus: false,
      ...options?.opts,
    },
  );

  return {
    ...swrResponse,
    refresh: swrResponse.mutate,
  };
};
