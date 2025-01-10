import { bexApiGraphqlClient } from "@bera/graphql";
import {
  ApiVaultFragment,
  GetVaults,
  GetVaultsQuery,
  GetVaultsQueryVariables,
} from "@bera/graphql/pol/api";

export interface GetGaugeData {
  gaugeCounts: number;
  gaugeList: ApiVaultFragment[];

  pagination: {
    currentPage: number;
    totalCount: number;
  };
}

export const getRewardVaults = async ({
  filter,
}: {
  filter?: GetVaultsQueryVariables;
} = {}): Promise<GetGaugeData> => {
  const res = await bexApiGraphqlClient.query<
    GetVaultsQuery,
    GetVaultsQueryVariables
  >({
    query: GetVaults,
    variables: filter,
  });

  if (res.error) {
    throw res.error;
  }

  const vaults = res.data.polGetRewardVaults?.vaults;

  return {
    pagination: res.data.polGetRewardVaults.pagination,
    gaugeCounts: res.data.polGetRewardVaults.pagination.totalCount,
    gaugeList: vaults,
  };
};
