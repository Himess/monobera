import { DefaultHookOptions, DefaultHookReturnType } from "~/types/global";
import { usePollGlobalData } from "./usePollGlobalData";

export interface BgtInflation {
  bgtInflation: number;
}

export const useBgtInflation = (
  options?: DefaultHookOptions,
): DefaultHookReturnType<BgtInflation | undefined> => {
  const res = usePollGlobalData(options);

  return {
    ...res,
    data: res.data?.bgtInfo,
  };
};
