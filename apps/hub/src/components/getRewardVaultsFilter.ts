import {
  GqlRewardVaultOrderBy,
  GqlRewardVaultOrderDirection,
} from "@bera/graphql/dex/api";
import type { SortingState } from "@tanstack/react-table";

const map: Record<string, GqlRewardVaultOrderBy> = {
  allTimeReceivedBGTAmount: GqlRewardVaultOrderBy.AllTimeBgtReceived,
  dynamicData_bgtCapturePercentage: GqlRewardVaultOrderBy.BgtCapturePercentage,
};
export const REWARD_VAULTS_PAGE_SIZE = 10;

export const getRewardVaultsFilter = (
  sorting: SortingState = [],
  page = 0,
  pageSize = REWARD_VAULTS_PAGE_SIZE,
  keywords = "",
) => {
  return {
    orderBy: map[sorting[0]?.id],
    orderDirection:
      sorting[0] !== undefined
        ? sorting[0]?.desc
          ? GqlRewardVaultOrderDirection.Desc
          : GqlRewardVaultOrderDirection.Asc
        : undefined,
    skip: pageSize * page,
    // filterByProduct: markets,
    pageSize: pageSize,
    search: keywords === "" || !keywords ? undefined : keywords,
  };
};
