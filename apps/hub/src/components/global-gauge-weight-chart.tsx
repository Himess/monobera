import React, { useCallback, useMemo, useRef, useState } from "react";
import { ADDRESS_ZERO } from "@bera/berajs";
import { FormattedNumber } from "@bera/shared-ui";
import { BeraChart } from "@bera/ui/bera-chart";
import { Skeleton } from "@bera/ui/skeleton";
import { type Chart, type TooltipModel } from "chart.js";
import uniqolor from "uniqolor";

import {
  ChartTooltip,
  CuttingBoardWeightMega,
} from "~/components/chart-tooltip";
import { ApiRewardAllocationWeightFragment } from "@bera/graphql/pol/api";

export const OTHERS_GAUGES = "Others"; // Identifier for aggregated others
export const THRESHOLD = 0.04;

export default function GlobalGaugeWeightChart({
  gaugeWeights,
  isLoading,
  totalBgtDistributed,
}: {
  gaugeWeights: ApiRewardAllocationWeightFragment[] | undefined;
  isLoading: boolean;
  totalBgtDistributed?: string;
}) {
  const tooltipRef = useRef<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedGauge, setSelectedGauge] = useState<any>();
  const [othersIndex, setOthersIndex] = useState<number>(-1);

  const gauges: CuttingBoardWeightMega[] = useMemo(() => {
    if (!gaugeWeights) return [];

    const gaugeW = gaugeWeights.map((gauge, index: number) => ({
      ...gauge,
      percentage: Number(gauge.percentageNumerator) / 10_000,
      id: index,
    }));

    const othersPercentage = gaugeW.reduce((acc, gauge) => {
      return acc + (gauge.percentage < THRESHOLD ? gauge.percentage : 0);
    }, 0);

    const filtered = gaugeW.filter((gauge) => {
      return gauge.percentage >= THRESHOLD;
    });

    const combined = [...filtered];

    // Only add the "Others" gauge if it has a significant percentage
    if (othersPercentage > THRESHOLD) {
      combined.push({
        receiverMetadata: {
          logoURI: "",
          name: OTHERS_GAUGES,
          product: OTHERS_GAUGES,
          receiptTokenAddress: ADDRESS_ZERO,
          url: "",
          vaultAddress: ADDRESS_ZERO,
        },
        id: combined.length,
        owner: ADDRESS_ZERO,
        receiver: ADDRESS_ZERO,
        percentage: othersPercentage,
        percentageNumerator: "",
      } as any);
    }
    setOthersIndex(combined.length - 1);

    return combined;
  }, [gaugeWeights]);

  const dataP = useMemo(() => {
    const backgroundColor = [];
    const hoverBorderColor = [];
    gauges.forEach((gauge) => {
      if (gauge.receiver && gauge.receiver !== ADDRESS_ZERO) {
        const bgColor = uniqolor(gauge.receiver).color;
        backgroundColor.push(bgColor);
        hoverBorderColor.push(`${bgColor}52`);
      }
    });
    if (othersIndex > -1 && gauges.length > 1) {
      if (
        gauges.some(
          (gauge) => gauge.receiver && gauge.receiver === ADDRESS_ZERO,
        )
      ) {
        const bgColor = uniqolor(ADDRESS_ZERO).color;
        backgroundColor.push(bgColor);
        hoverBorderColor.push(`${bgColor}52`);
      }
    }
    return {
      labels: gauges?.map((d) => d.receiver),
      datasets: [
        {
          hoverBorderWidth: 10,
          borderRadius: 8,
          spacing: 5,
          borderWidth: 0,
          backgroundColor,
          hoverBorderColor,
          data: gauges?.map((d) => d.percentage),
        },
      ],
    };
  }, [gauges]);

  const externalTooltipHandler = useCallback(
    ({ tooltip }: { tooltip: TooltipModel<"doughnut">; chart: Chart }) => {
      // hide tooltip
      if (tooltip.opacity === 0) {
        setSelectedGauge(undefined);
        tooltipRef.current = null;
        return;
      }
      // already visible
      if (tooltipRef.current === `${tooltip.caretX},${tooltip.caretX}`) {
        return;
      }
      // set tooltip visible
      tooltipRef.current = `${tooltip.caretX},${tooltip.caretX}`;
      setSelectedGauge(tooltip.title[0]);
      setTooltipPosition({ x: tooltip.caretX, y: tooltip.caretY });
    },
    [gaugeWeights],
  );

  const gauge: CuttingBoardWeightMega | undefined = gauges.find(
    (gauge: CuttingBoardWeightMega) => gauge.receiver === selectedGauge,
  );

  return (
    <div className="w-full rounded-lg border border-border p-6 lg:items-stretch">
      <div className="text-center mb-10 text-sm font-medium leading-5 text-muted-foreground">
        Reward Weights
      </div>

      {isLoading ? (
        <Skeleton className="relative mx-auto rounded-full" />
      ) : (
        <div className="relative mx-auto">
          <BeraChart
            data={dataP}
            className="w-full"
            options={{
              responsive: true,
              cutout: "70%",
              radius: "95%",
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: false, // @ts-ignore
                  external: externalTooltipHandler,
                },
              },
            }}
            type="doughnut"
          />
          {totalBgtDistributed ? (
            <div className="absolute inset-0 flex items-center justify-center h-full text-center pointer-events-none">
              <div>
                <h3 className="text-muted-foreground uppercase text-xs font-medium tracking-wide select-none">
                  BGT Distributed
                </h3>
                <p className="font-semibold">
                  <FormattedNumber value={totalBgtDistributed} compact />
                </p>
              </div>
            </div>
          ) : undefined}
          <div
            className="z-1 pointer-events-none absolute hidden -translate-y-1/2 transform transition-all duration-200 ease-in-out sm:block"
            style={{
              top: `${tooltipPosition.y}px`,
              ...(tooltipPosition.x < 300 / 2
                ? { left: tooltipPosition.x }
                : { right: 300 - tooltipPosition.x }),
            }}
          >
            <ChartTooltip gauge={gauge} />
          </div>
          <div className="z-1 pointer-events-none absolute left-[50%] top-[50%] block -translate-x-1/2 -translate-y-1/2 transform transition-all duration-200 ease-in-out sm:hidden">
            <ChartTooltip gauge={gauge} />
          </div>
        </div>
      )}
    </div>
  );
}
