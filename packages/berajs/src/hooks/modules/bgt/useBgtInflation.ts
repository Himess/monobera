import { DefaultHookOptions, DefaultHookReturnType } from "~/types/global";
import { usePollGlobalData } from "./usePollGlobalData";

export interface BgtInflation {
  annualizedBGTEmission: number;
  annualizedBGTInflation: number;
}

export const useBgtInflation = (
  options?: DefaultHookOptions,
): DefaultHookReturnType<BgtInflation | undefined> => {
  const res = usePollGlobalData(options);

  return {
    ...res,
    data: {
      annualizedBGTEmission: Number(res.data?.annualizedBGTEmission ?? 0),
      annualizedBGTInflation: Number(res.data?.annualizedBGTInflation ?? 0),
    },
  };
};
