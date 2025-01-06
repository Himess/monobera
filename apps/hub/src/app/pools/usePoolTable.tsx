import { useMemo, useState } from "react";
import { MinimalPoolInListFragment } from "@bera/graphql/dex/api";
import {
  DataTableColumnHeader,
  FormattedNumber,
  useAsyncTable,
} from "@bera/shared-ui";
import { ColumnDef } from "@tanstack/react-table";

import { PoolSummary } from "../../components/pools-table-columns";
import { usePools } from "./usePools";

export const usePoolTable = ({
  sorting,
  userPoolsOnly,
}: {
  sorting: any;
  page: number;
  pageSize: number;
  textSearch?: string;
  userPoolsOnly?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      setKeyword(search);
    }
  };

  const {
    pools: allPools,
    isPoolsLoading,
    walletPools,
  } = usePools({ keyword });

  const pools = userPoolsOnly ? walletPools : allPools;

  // NOTE: we memoize this to reduce render thrashing on page load (in accordance with tanstack best practices)
  const tableColumns: ColumnDef<MinimalPoolInListFragment>[] = useMemo(() => {
    return [
      {
        accessorKey: "address",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            className="flex items-center gap-1"
            title={"Pool Composition"}
          />
        ),
        cell: ({ row }) => {
          const isWhitelistedVault =
            row.original.rewardVault?.isVaultWhitelisted;
          const providedLiquidity =
            row.original.userBalance &&
            row.original.userBalance?.totalBalanceUsd > 0;
          return (
            <PoolSummary
              pool={row.original}
              isWhitelistedVault={isWhitelistedVault ?? false}
              providedLiquidity={providedLiquidity ?? false}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
        minSize: 320,
      },
      {
        accessorKey: "totalLiquidity",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="TVL"
            className="min-w-[95px]"
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="text-sm leading-5">
              <FormattedNumber
                value={row.original.dynamicData?.totalLiquidity ?? 0}
                symbol="USD"
              />
            </div>
          </div>
        ),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        sortingFn: (rowA, rowB) => {
          return (
            Number(rowA.original.dynamicData?.totalLiquidity ?? "0") -
            Number(rowB.original.dynamicData?.totalLiquidity ?? "0")
          );
        },
      },
      {
        accessorKey: "dynamicData__fees24h",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Fees (24h)"
            className="whitespace-nowrap"
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="text-sm leading-5">
              <FormattedNumber
                value={row.original.dynamicData?.fees24h ?? "0"}
                symbol="USD"
              />
            </div>
          </div>
        ),
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        sortingFn: (rowA, rowB) => {
          return (
            Number(rowA.original.dynamicData?.fees24h ?? "0") -
            Number(rowB.original.dynamicData?.fees24h ?? "0")
          );
        },
      },
      {
        accessorKey: "dynamicData__volume24h",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Volume (24h)"
            className="whitespace-nowrap"
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="text-sm leading-5">
              <FormattedNumber
                value={row.original.dynamicData?.volume24h ?? "0"}
                symbol="USD"
              />
            </div>
          </div>
        ),
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        sortingFn: (rowA, rowB) => {
          return (
            Number(rowA.original.dynamicData?.volume24h ?? "0") -
            Number(rowB.original.dynamicData?.volume24h ?? "0")
          );
        },
      },
      {
        accessorKey: "dynamicData__aprItems__0__apr",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="APY"
            className="whitespace-nowrap"
          />
        ),
        cell: ({ row }) => {
          // NOTE: typically you would never sum APY and APR directly, but @don have given go ahead to do so in this
          // case as the APY is not a 'real' APY.
          let vaultAPY = Number(
            row.original.rewardVault?.dynamicData?.apy ?? 0,
          );
          const poolAPR = Number(
            row.original.dynamicData?.aprItems?.at(0)?.apr ?? 0,
          );
          // If a vault APY is -1 it's null.
          if (vaultAPY < 0) {
            vaultAPY = 0;
          } else {
            // vault APYs are stored as percentages unlike pool APRs
            vaultAPY /= 100;
          }

          const effectiveAPY = vaultAPY + poolAPR;

          return (
            <div
              className={`flex items-center justify-start text-sm ${
                effectiveAPY === 0
                  ? "text-info-foreground"
                  : "text-warning-foreground"
              }`}
              title={`pool APR: ${(poolAPR * 100).toFixed(2)}%, vault APY: ${(
                vaultAPY * 100
              ).toFixed(2)}%`} // TODO (#BFE-463): tooltip for this
            >
              <FormattedNumber
                value={effectiveAPY?.toString() ?? "0"}
                percent
                compact
                showIsSmallerThanMin
              />
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        sortingFn: (rowA, rowB) => {
          return (
            Number(rowA.original.rewardVault?.dynamicData?.apy ?? 0) +
            Number(rowA.original.dynamicData?.aprItems?.at(0)?.apr ?? 0) -
            (Number(rowB.original.rewardVault?.dynamicData?.apy ?? 0) +
              Number(rowB.original.dynamicData?.aprItems?.at(0)?.apr ?? 0))
          );
        },
      },
    ];
  }, [pools]);

  const table = useAsyncTable<MinimalPoolInListFragment>({
    data: pools ?? [],
    fetchData: async () => {},
    additionalTableProps: {
      initialState: { sorting, pagination: { pageSize: 10, pageIndex: 0 } },
      manualPagination: false,
      manualSorting: false,
    },
    enablePagination: true,
    enableRowSelection: false,
    columns: tableColumns,
  });

  return {
    data: pools,
    table,
    search,
    setSearch,
    isLoading: isPoolsLoading,
    handleEnter,
    keyword,
    setKeyword,
  };
};
