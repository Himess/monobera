import { useMemo, useState } from "react";
import {
  ADDRESS_ZERO,
  useBgtInflation,
  useIsWhitelistedVault,
  useRewardVaultsFromTokens,
} from "@bera/berajs";
import { MinimalPoolInListFragment } from "@bera/graphql/dex/api";
import {
  DataTableColumnHeader,
  FormattedNumber,
  TokenIconList,
  useAsyncTable,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Badge } from "@bera/ui/badge";
import { Icons } from "@bera/ui/icons";
import { ColumnDef } from "@tanstack/react-table";

import {
  PoolSummary,
  poolTypeLabels,
} from "../../components/pools-table-columns";
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

  // Fetch reward vault addresses from token addresses
  const tokenAddresses = useMemo(
    () => pools?.map((pool) => pool.address) || [],
    [pools],
  );

  // Extract vault addresses from the token addresse and fetch the whitelist statuses for all of those vaults
  const { data: rewardVaults } = useRewardVaultsFromTokens({
    tokenAddresses,
  });

  const vaultAddresses = useMemo(
    () => Object.values(rewardVaults ?? {}).filter((v) => v !== ADDRESS_ZERO),
    [rewardVaults],
  );

  const { data: whitelistedVaults } = useIsWhitelistedVault(vaultAddresses);

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
          const rewardVault =
            rewardVaults?.[row.original.address.toLowerCase()];
          const isWhitelistedVault = rewardVault
            ? whitelistedVaults?.some(
                (vault) =>
                  vault.address.toLowerCase() === rewardVault.toLowerCase() &&
                  vault.isWhitelisted,
              ) ?? false
            : false;

          // console.log(
          //   "row.original.userBalance.walletBalance",
          //   row.original.userBalance && row.original.userBalance.walletBalance,
          // );
          // const providedLiquidity =
          //   row.original.userBalance &&
          //   row.original.userBalance.walletBalance !== "0";
          // const pool = row.original;
          return (
            // <div className="flex items-center gap-2">
            //   <div className="flex flex-row items-start gap-2">
            //     <TokenIconList
            //       tokenList={pool?.tokens.filter(
            //         (t) => t.address !== pool.address,
            //       )}
            //       size="xl"
            //       className="self-center"
            //     />
            //     <div className="flex flex-col items-start justify-start gap-1">
            //       <div className="flex flex-row items-center justify-start gap-1">
            //         <span className="flex w-fit max-w-[180px] flex-row gap-1 truncate text-left text-sm font-semibold">
            //           {pool?.name}
            //           {isWhitelistedVault && (
            //             <div
            //               title="This rewards vault is whitelisted"
            //               className="pt-1"
            //             >
            //               <Icons.bgt className="h-4 w-4" />
            //             </div>
            //           )}
            //         </span>
            //       </div>
            //       <div className="flex items-center gap-3">
            //         <span className=" text-xs text-muted-foreground">
            //           {pool.type in poolTypeLabels
            //             ? poolTypeLabels[pool.type]
            //             : pool.type}
            //         </span>
            //         <Badge
            //           variant={"secondary"}
            //           className="border-none px-2 py-1 text-[10px] leading-[10px] text-foreground"
            //         >
            //           <span>
            //             {(Number(pool?.dynamicData?.swapFee) * 100).toFixed(2)}%
            //           </span>
            //         </Badge>
            //         <Badge
            //           variant="success"
            //           className={cn(
            //             "border-none bg-success px-2 py-1 text-[10px] leading-[10px]",
            //             providedLiquidity
            //               ? "opacity-100"
            //               : "pointer-events-none opacity-0",
            //           )}
            //         >
            //           <span>Provided Liquidity</span>
            //         </Badge>
            //       </div>
            //     </div>
            //   </div>
            // </div>
            <PoolSummary
              pool={row.original}
              isWhitelistedVault={isWhitelistedVault}
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
                value={row.original?.dynamicData?.totalLiquidity ?? 0}
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
            Number(rowA.original.dynamicData.totalLiquidity ?? "0") -
            Number(rowB.original.dynamicData.totalLiquidity ?? "0")
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
                value={row.original.dynamicData.fees24h ?? "0"}
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
            Number(rowA.original.dynamicData.fees24h ?? "0") -
            Number(rowB.original.dynamicData.fees24h ?? "0")
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
                value={row.original.dynamicData.volume24h ?? "0"}
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
            Number(rowA.original.dynamicData.volume24h ?? "0") -
            Number(rowB.original.dynamicData.volume24h ?? "0")
          );
        },
      },
      {
        accessorKey: "dynamicData__aprItems__0__apr",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="APR"
            className="whitespace-nowrap"
          />
        ),
        cell: ({ row }) => {
          return (
            <div
              className={`flex items-center justify-start text-sm ${
                row.original.dynamicData.aprItems?.at(0)?.apr === 0
                  ? "text-info-foreground"
                  : "text-warning-foreground"
              }`}
            >
              <FormattedNumber
                value={
                  row.original.dynamicData.aprItems?.at(0)?.apr?.toString() ??
                  "0"
                }
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
            Number(rowA.original.dynamicData.aprItems?.at(0)?.apr ?? "0") -
            Number(rowB.original.dynamicData.aprItems?.at(0)?.apr ?? "0")
          );
        },
      },
    ];
  }, [pools, rewardVaults, whitelistedVaults]);

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
