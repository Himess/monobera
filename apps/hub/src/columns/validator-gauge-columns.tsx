import React from "react";
import { DataTableColumnHeader, FormattedNumber } from "@bera/shared-ui";
import { type ColumnDef } from "@tanstack/react-table";

import { BribesPopover } from "~/components/bribes-tooltip";
import { GaugeHeaderWidget } from "~/components/gauge-header-widget";
import {
  ApiRewardAllocationWeightFragment,
  ApiValidatorFragment,
} from "@bera/graphql/pol/api";
import { Address } from "viem";
import { useRewardVault } from "@bera/berajs";

export const getValidatorGaugeColumns = (validator: ApiValidatorFragment) => {
  const validatorGaugeColumns: ColumnDef<ApiRewardAllocationWeightFragment>[] =
    [
      {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Reward Vaults" />
        ),
        cell: ({ row }) => {
          const { data } = useRewardVault(row.original.receiver as Address, {
            opts: { revalidateOnFocus: false },
          });
          return <GaugeHeaderWidget gauge={data} className="w-[150px]" />;
        },
        accessorKey: "gauge",
        enableSorting: false,
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="BGT Per Proposal"
            className="whitespace-nowrap"
            tooltip={
              "Amount of BGT per proposal sent by this validator to a vault"
            }
          />
        ),
        cell: ({ row }) => {
          const weight = row.original?.percentageNumerator / 1e5 ?? 0;

          const perProposal =
            weight * Number(validator.dynamicData?.rewardRate ?? 0);

          return (
            <FormattedNumber
              className="w-full justify-start"
              symbol="BGT"
              compact={false}
              compactThreshold={999_999_999}
              showIsSmallerThanMin
              value={perProposal}
            />
          );
        },
        accessorKey: "bgt-staked",
        enableSorting: false,
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Total Incentive Value"
            className="whitespace-nowrap"
            tooltip={
              "Total value of active incentives outstanding on this vault"
            }
          />
        ),
        cell: ({ row }) => (
          <FormattedNumber
            symbol="USD"
            compact={false}
            compactThreshold={999_999_999}
            value={
              row.original.receivingVault?.dynamicData
                ?.activeIncentivesValueUsd ?? 0
            }
          />
        ),
        accessorKey: "receivingVault.dynamicData.activeIncentivesValueUsd",
        enableSorting: false,
      },
      {
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Incentives"
            className="whitespace-nowrap"
            tooltip={
              "Incentives being emitted by this vault to attract BGT rewards"
            }
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1">
              <BribesPopover
                incentives={row.original.receivingVault?.activeIncentives}
              />
              {/* <Button
            size="sm"
            variant="ghost"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(
                `/incentivize?gauge=${row.original.vaultAddress}`,
                "_self",
              );
            }}
          >
            Add
          </Button> */}
            </div>
          );
        },
        accessorKey: "incentives",
        enableSorting: false,
      },
    ];
  return validatorGaugeColumns;
};
