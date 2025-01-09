"use client";

import React from "react";
import { usePollGlobalData, usePollGlobalDataQueryKey } from "@bera/berajs";

import GlobalGaugeWeightChart from "~/components/global-gauge-weight-chart";
import GaugeTables from "./gauge-tables";
import GaugeInfoCard from "./gauge-info-card";
import { GaugeCreation } from "./gauge-creation";
import { SWRFallback } from "@bera/berajs";
import { unstable_serialize } from "swr";
import { useRewardVaultsQueryKey } from "@bera/berajs";
import { getRewardVaultsFilter } from "~/components/getRewardVaultsFilter";
import { GetGaugeData, GlobalData } from "@bera/berajs/actions";

export default function RewardVaults({
  vaults,
  globalInfo,
}: {
  vaults: GetGaugeData | undefined;
  globalInfo: GlobalData | undefined;
}) {
  return (
    <SWRFallback
      fallback={{
        [unstable_serialize(useRewardVaultsQueryKey(getRewardVaultsFilter()))]:
          vaults,
        [unstable_serialize(usePollGlobalDataQueryKey())]: globalInfo,
      }}
    >
      <Gauge />
    </SWRFallback>
  );
}

export function Gauge() {
  const { data, isLoading: isGlobalDataLoading } = usePollGlobalData();
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
        <GaugeInfoCard />
        <GlobalGaugeWeightChart
          gaugeWeights={data?.globalCuttingBoard ?? []}
          isLoading={isGlobalDataLoading}
          totalBgtDistributed={data?.totalDistributedBGTAmount ?? "0"}
        />
      </div>
      <GaugeTables />
      <GaugeCreation />
    </div>
  );
}
