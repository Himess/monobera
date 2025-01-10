import React from "react";
import Link from "next/link";
import {
  truncateHash,
  useBgtInflation,
  useBlockTime,
  usePollGlobalData,
} from "@bera/berajs";
import { FormattedNumber, ValidatorIcon } from "@bera/shared-ui";
import { getHubValidatorPath } from "@bera/shared-ui";
import { Icons } from "@bera/ui/icons";
import { Skeleton } from "@bera/ui/skeleton";

import { getValidatorEstimatedBgtPerYear } from "~/hooks/useValidatorEstimatedBgtPerYear";
import { Address } from "viem";
import { Badge } from "@bera/ui/badge";

export default function GaugeInfoCard() {
  const { data: globalData, isLoading } = usePollGlobalData();

  const { data: bgtInflation } = useBgtInflation();

  const blockTime = useBlockTime();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] w-full flex-1  gap-4 sm:gap-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2">
        <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border px-4 py-6">
          <div className="text-sm font-medium leading-5 text-muted-foreground">
            Active Reward Vaults
          </div>
          {globalData ? (
            <span className="text-2xl font-semibold leading-8">
              {globalData?.activeRewardVaultCount}
            </span>
          ) : (
            <Skeleton className="h-8 w-[125px] " />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border px-4 py-6">
          <div className="text-sm font-medium leading-5 text-muted-foreground">
            Active Incentives
          </div>
          {globalData ? (
            <FormattedNumber
              value={globalData.totalActiveIncentivesValueUSD ?? 0}
              symbol="USD"
              className="items-center text-2xl font-bold leading-5"
            />
          ) : (
            <Skeleton className="h-8 w-[100px]" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border px-4 py-6">
          <div className="text-sm font-medium leading-5 text-muted-foreground">
            Total Circulating BGT
          </div>
          {!globalData ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="flex items-center gap-1">
              <FormattedNumber
                value={globalData?.bgtTotalSupply ?? 0}
                className="items-center text-2xl font-bold leading-5"
              />
              <Icons.bgt className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-lg border border-border px-4 py-6">
          <div className="text-sm font-medium leading-5 text-muted-foreground">
            BGT Distribution (Yearly)
          </div>
          {!bgtInflation ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <div className="sm:flex gap-2">
              <FormattedNumber
                value={bgtInflation?.annualizedBGTEmission ?? 0}
                compact={false}
                compactThreshold={999_999}
                className="items-center text-2xl font-bold leading-5"
              />
              <Badge variant="success">
                <FormattedNumber
                  value={bgtInflation?.annualizedBGTInflation ?? 0}
                  percent
                />
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 rounded-lg border border-border px-4 py-6">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium leading-5 text-muted-foreground">
            # Of Active Validators
          </div>
          {!globalData ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-semibold">
              {" "}
              {globalData.validatorCount}{" "}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="text-xs font-medium uppercase leading-5 tracking-wider text-muted-foreground ">
            Top 3 Validators
          </div>
          {globalData ? (
            globalData.top3EmittingValidators?.map((validator, index) => {
              const estimatedBgtPerYear = getValidatorEstimatedBgtPerYear(
                validator,
                globalData.validatorCount,
                blockTime,
              );

              return (
                <Link
                  className="cursor-pointer flex w-full flex-1 items-center gap-2 rounded-sm border border-border bg-background px-4 py-2"
                  key={`${index}-${validator.id}`}
                  href={getHubValidatorPath(validator.pubkey)}
                  target="_blank"
                >
                  <ValidatorIcon
                    address={validator.pubkey as Address}
                    size="xl"
                    imgOverride={validator.metadata?.logoURI}
                  />
                  <div>
                    <div className="text-nowrap text-sm font-semibold leading-5">
                      {validator?.metadata?.name ??
                        truncateHash(validator.pubkey)}
                    </div>
                    <FormattedNumber
                      value={estimatedBgtPerYear}
                      showIsSmallerThanMin
                      symbol="BGT/Year"
                      className="block text-nowrap text-[10px] font-medium leading-3 text-muted-foreground"
                    />
                  </div>
                </Link>
              );
            })
          ) : (
            <>
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
