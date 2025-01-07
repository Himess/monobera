import { balancerApiChainName } from "@bera/config";
import { bexApiGraphqlClient } from "@bera/graphql";
import { GqlChain } from "@bera/graphql/dex/api";
import {
  ApiValidatorFragment,
  GlobalData,
  GlobalDataQuery,
  GlobalDataQueryVariables,
} from "@bera/graphql/pol/api";
import type { BeraConfig } from "~/types";

export interface GlobalInfo {
  totalActiveIncentivesValueUSD: string;
  top3EmittingValidators: ApiValidatorFragment[];
  validatorCount: number;
  activeRewardVaultCount: number;
  whitelistedRewardVaultCount: number;
  totalDistributedBGTAmount: string;
  annualizedBGTEmission: string;
  annualizedBGTInflation: string;
}

export const getBGTGlobalInfo = async (
  config: BeraConfig,
): Promise<GlobalInfo | undefined> => {
  const apiRes = await bexApiGraphqlClient.query<
    GlobalDataQuery,
    GlobalDataQueryVariables
  >({
    query: GlobalData,
    variables: {
      chain: balancerApiChainName as GqlChain,
    },
  });

  const data = apiRes.data;

  return {
    totalActiveIncentivesValueUSD:
      data.polGetGlobalInfo?.totalActiveIncentivesValueUSD ?? "0",
    validatorCount: data.polGetGlobalInfo?.totalValidatorsCount ?? 0,
    activeRewardVaultCount: data.polGetGlobalInfo?.totalActiveRewardVaults ?? 0,
    whitelistedRewardVaultCount:
      data.polGetGlobalInfo?.totalWhitelistedRewardVaults ?? 0,
    top3EmittingValidators: apiRes.data.top3EmittingValidators.validators,
    totalDistributedBGTAmount:
      data.polGetGlobalInfo?.totalDistributedBGTAmount ?? "0",
    annualizedBGTEmission: data.polGetGlobalInfo?.annualizedBGTEmission ?? "0",
    annualizedBGTInflation:
      data.polGetGlobalInfo?.annualizedBGTInflation ?? "0",
  } satisfies GlobalInfo;
};
