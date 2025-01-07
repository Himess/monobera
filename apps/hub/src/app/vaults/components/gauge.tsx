"use client";

import React from "react";
import { usePollGlobalData } from "@bera/berajs";

import GlobalGaugeWeightChart from "~/components/global-gauge-weight-chart";
import GaugeTables from "./gauge-tables";
import GaugeInfoCard from "./gauge-info-card";
import { GaugeCreation } from "./gauge-creation";

export default function Gauge() {
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
