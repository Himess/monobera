import React from "react";

import RewardVaultsPage from "./components/RewardVaults";
import { getGlobalData, getRewardVaults } from "@bera/berajs/actions";
import { getRewardVaultsFilter } from "~/components/getRewardVaultsFilter";
import { getServerSidePublicClient } from "~/utils/serverSidePublicClient";
import { defaultBeraConfig } from "@bera/berajs/config";

export default async function Page() {
  const publicClient = await getServerSidePublicClient();

  const [vaults, globalData] = await Promise.allSettled([
    getRewardVaults({ filter: getRewardVaultsFilter() }),
    getGlobalData(
      // @ts-ignore viem types
      publicClient,
      defaultBeraConfig,
    ),
  ]);

  return (
    <RewardVaultsPage
      vaults={vaults.status === "fulfilled" ? vaults.value : undefined}
      globalInfo={
        globalData.status === "fulfilled" ? globalData.value : undefined
      }
    />
  );
}
