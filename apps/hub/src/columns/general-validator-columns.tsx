import { truncateHash, useTokenHoneyPrice } from "@bera/berajs";
import { beraTokenAddress } from "@bera/config";
import {
  DataTableColumnHeader,
  FormattedNumber,
  Tooltip,
  ValidatorIcon,
  bribeApyTooltipText,
} from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { type Address } from "viem";

import { ApiValidatorFragment, ApiVaultFragment } from "@bera/graphql/pol/api";
import { CuttingBoardDisplay } from "~/app/validators/components/ValidatorsTable";
import { BribesPopover } from "~/components/bribes-tooltip";
import { useValidatorEstimatedBgtPerYear } from "~/hooks/useValidatorEstimatedBgtPerYear";
import { ValidatorWithUserBoost } from "@bera/berajs/actions";

const VALIDATOR_COLUMN: ColumnDef<ApiValidatorFragment> = {
  header: "Validator",
  cell: ({ row }) => (
    <div className="flex items-center gap-1 overflow-hidden truncate">
      <ValidatorIcon
        address={row.original.id as Address}
        className="h-8 w-8 flex-shrink-0"
        imgOverride={row.original.metadata?.logoURI}
      />
      <span className="flex-grow truncate">
        {row.original.metadata?.name ?? truncateHash(row.original.pubkey)}
      </span>
    </div>
  ),
  minSize: 200,
  accessorKey: "name",
  enableSorting: false,
};

const BOOSTS_COLUMN: ColumnDef<ApiValidatorFragment> = {
  header: "Boosts",
  cell: ({ row }) => (
    <div className="w-full text-start">
      <FormattedNumber
        value={row.original.dynamicData?.activeBoostAmount ?? 0}
        symbol="BGT"
      />
    </div>
  ),
  minSize: 150,

  accessorKey: "dynamicData.activeBoostAmount",

  sortingFn: (a, b) => {
    return (
      Number(a.original.dynamicData?.activeBoostAmount) -
      Number(b.original.dynamicData?.activeBoostAmount)
    );
  },
  enableSorting: true,
};

const STAKED_BERAS_COLUMN: ColumnDef<ApiValidatorFragment> = {
  header: "Staked",
  cell: ({ row }) => (
    <div className="w-full text-start">
      <FormattedNumber
        value={row.original.dynamicData?.stakedBeraAmount ?? 0}
        symbol="BERA"
        compact
      />
    </div>
  ),
  minSize: 150,

  accessorKey: "dynamicData.stakedBeraAmount",
  enableSorting: true,
};

const APY_COLUMN: ColumnDef<ApiValidatorFragment> = {
  header: "BGT Emissions (24h)",
  cell: ({ row }) => (
    <div className="flex h-full items-center">
      <FormattedNumber
        value={Number(
          row.original.dynamicData?.lastDayDistributedBGTAmount ?? 0,
        )}
        symbol="BGT"
      />
    </div>
  ),
  minSize: 200,
  meta: {
    headerClassname: "flex-initial",
  },
  accessorKey: "dynamicData.lastDayDistributedBGTAmount",
  enableSorting: true,
};

const MOST_WEIGHTED_GAUGE_COLUMN: ColumnDef<ApiValidatorFragment> = {
  header: "Main Reward Vault",
  cell: ({ row }) => {
    const cuttingBoards = [...(row.original.rewardAllocationWeights ?? [])];

    const mostWeightedCuttingBoard = cuttingBoards.sort(
      (a, b) => Number(b.percentageNumerator) - Number(a.percentageNumerator),
    )[0];
    return <CuttingBoardDisplay cuttingBoard={mostWeightedCuttingBoard} />;
  },
  accessorKey: "mostWeightedGauge",
  meta: {
    headerClassname: "whitespace-nowrap",
  },
  enableSorting: false,
};

const BRIBES_COLUMN: ColumnDef<ValidatorWithUserBoost> = {
  header: "Incentives",
  cell: ({ row }) => {
    return (
      <BribesPopover
        incentives={row.original.rewardAllocationWeights
          .filter((x) => x?.receivingVault)
          .flatMap((rv) => rv.receivingVault!.activeIncentives!)
          .filter((x) => Number(x.remainingAmount))}
      />
    );
  },
  accessorKey: "bribes",
  enableSorting: false,
};

const CLAIMABLE_BRIBES_COLUMN: ColumnDef<ValidatorWithUserBoost> = {
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Incentives" />
  ),
  cell: ({ row }) => {
    return (
      <div className="flex flex-row items-center gap-1">
        <BribesPopover
          incentives={row.original.rewardAllocationWeights
            ?.filter((rv) => rv.receivingVault)
            .flatMap((rv) => rv.receivingVault!.activeIncentives!)}
        />
        <Tooltip
          text={"Claiming coming soon"}
          toolTipTrigger={
            <Button disabled size="sm">
              Claim
            </Button>
          }
        />
      </div>
    );
  },
  accessorKey: "bribes",
  enableSorting: false,
};

const USER_BOOSTED_COLUMN: ColumnDef<ValidatorWithUserBoost> = {
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Boosts"
      className="whitespace-nowrap"
    />
  ),
  cell: ({ row }) => {
    return (
      <FormattedNumber
        showIsSmallerThanMin
        value={row.original.userBoosts.activeBoostAmount ?? 0}
        symbol="BGT"
      />
    );
  },
  accessorKey: "userBoosts.activeBoostAmount",
  sortingFn: (a, b) =>
    Number(a.original.userBoosts.activeBoostAmount) -
    Number(b.original.userBoosts.activeBoostAmount),
  enableSorting: true,
};

const USER_QUEUED_BOOSTS_COLUMN: ColumnDef<ValidatorWithUserBoost> = {
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Queued Boosts"
      className="whitespace-nowrap"
    />
  ),
  cell: ({ row }) => {
    return (
      <FormattedNumber
        value={row.original.userBoosts?.queuedBoostAmount ?? 0}
        symbol="BGT"
      />
    );
  },
  accessorKey: "userBoosts.queuedBoostAmount",
  sortingFn: (a, b) =>
    Number(a.original.userBoosts?.queuedBoostAmount) -
    Number(b.original.userBoosts?.queuedBoostAmount),
  enableSorting: true,
};

const USER_QUEUED_DROP_BOOSTS_COLUMN: ColumnDef<ValidatorWithUserBoost> = {
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Queued Unboosts"
      className="whitespace-nowrap"
    />
  ),
  cell: ({ row }) => {
    return (
      <FormattedNumber
        value={
          Number(row.original.userBoosts?.queuedDropBoostAmount) > 0
            ? -row.original.userBoosts?.queuedDropBoostAmount
            : 0
        }
        symbol="BGT"
        colored
      />
    );
  },
  accessorKey: "userBoosts.queuedDropBoostAmount",
  sortingFn: (a, b) =>
    Number(a.original.userBoosts?.queuedDropBoostAmount) -
    Number(b.original.userBoosts?.queuedDropBoostAmount),
  enableSorting: true,
};

export const getGaugeValidatorColumns = (rewardVault: ApiVaultFragment) => {
  const gauge_validator_columns: ColumnDef<ApiValidatorFragment>[] = [
    VALIDATOR_COLUMN,
    {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="BGT Per Proposal"
          tooltip={
            "Amount of BGT this validator is directing to this vault each proposal"
          }
        />
      ),
      cell: ({ row }) => {
        const { data: price } = useTokenHoneyPrice({
          tokenAddress: beraTokenAddress,
        });

        const cuttingBoard = row.original.rewardAllocationWeights.find(
          (cb: any) =>
            cb.receiver.toLowerCase() === rewardVault.address.toLowerCase(),
        );

        if (!cuttingBoard) {
          console.warn("No cutting board");

          return (
            <FormattedNumber
              className="w-full justify-start"
              symbol="BGT"
              compact={false}
              compactThreshold={999_999_999}
              value={0}
            />
          );
        }

        const weight = cuttingBoard?.percentageNumerator / 1e4 ?? 0;
        const perProposal =
          weight * parseFloat(row.original.dynamicData?.rewardRate ?? "0");

        return (
          <div className="flex flex-col gap-1">
            <FormattedNumber
              value={perProposal}
              compact
              showIsSmallerThanMin
              symbol="BGT"
            />
            <span className="text-xs text-muted-foreground">
              <FormattedNumber
                value={perProposal * parseFloat(price ?? "0")}
                showIsSmallerThanMin
                symbol="USD"
              />
            </span>
          </div>
        );
      },
      accessorKey: "rewardRate",
      enableSorting: true,
      sortingFn: (a, b) => {
        const cuttingBoardA = a.original.rewardAllocationWeights.find(
          (cb: any) =>
            cb.receiver.toLowerCase() === rewardVault.address.toLowerCase(),
        );
        const cuttingBoardB = b.original.rewardAllocationWeights.find(
          (cb: any) =>
            cb.receiver.toLowerCase() === rewardVault.address.toLowerCase(),
        );
        return (
          Number(cuttingBoardA?.percentageNumerator) *
            Number(a.original.dynamicData?.rewardRate ?? 0) -
          Number(cuttingBoardB?.percentageNumerator) *
            Number(b.original.dynamicData?.rewardRate ?? 0)
        );
      },
    },
    {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Estimated BGT/yr"
          tooltip={
            "Amount of BGT this validator is directing to this vault yearly"
          }
        />
      ),
      cell: ({ row }) => {
        const { data: price } = useTokenHoneyPrice({
          tokenAddress: beraTokenAddress,
        });

        const cuttingBoard = row.original.rewardAllocationWeights.find(
          (cb: any) =>
            cb.receiver.toLowerCase() === rewardVault.address.toLowerCase(),
        );
        if (!cuttingBoard)
          return (
            <FormattedNumber
              className="w-full justify-start"
              symbol="BGT"
              compact={false}
              compactThreshold={999_999_999}
              value={0}
            />
          );
        const estimatedYearlyBgt = useValidatorEstimatedBgtPerYear(
          row.original,
        );
        const weight = cuttingBoard?.percentageNumerator / 1e4;

        const estimatedAmountDirected = weight * estimatedYearlyBgt;

        return (
          <div className="flex flex-col gap-1">
            <FormattedNumber
              value={estimatedAmountDirected}
              compact
              showIsSmallerThanMin
              symbol="BGT"
            />
            <span className="text-xs text-muted-foreground">
              <FormattedNumber
                value={estimatedAmountDirected * parseFloat(price ?? "0")}
                showIsSmallerThanMin
                symbol="USD"
              />
            </span>
          </div>
        );
      },
      accessorKey: "yearlyBgt",
      enableSorting: false,
    },
  ];

  return gauge_validator_columns;
};

export const generalValidatorColumns: ColumnDef<ApiValidatorFragment>[] = [
  VALIDATOR_COLUMN,
  BOOSTS_COLUMN,
  STAKED_BERAS_COLUMN,
  APY_COLUMN,
  MOST_WEIGHTED_GAUGE_COLUMN,
  BRIBES_COLUMN as ColumnDef<ApiValidatorFragment>,
];

export const user_general_validator_columns: ColumnDef<ValidatorWithUserBoost>[] =
  [
    VALIDATOR_COLUMN as ColumnDef<ValidatorWithUserBoost>,
    USER_BOOSTED_COLUMN,
    USER_QUEUED_BOOSTS_COLUMN,
    USER_QUEUED_DROP_BOOSTS_COLUMN,
    { ...APY_COLUMN, enableSorting: true } as ColumnDef<ValidatorWithUserBoost>,
    BRIBES_COLUMN,
  ];

export const user_incentives_columns: ColumnDef<ValidatorWithUserBoost>[] = [
  VALIDATOR_COLUMN as ColumnDef<ValidatorWithUserBoost>,
  USER_BOOSTED_COLUMN,
  APY_COLUMN as ColumnDef<ValidatorWithUserBoost>,
  CLAIMABLE_BRIBES_COLUMN,
];
