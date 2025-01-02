import { useEffect, useMemo, useState } from "react";
import {
  ADDRESS_ZERO,
  useBgtInflation,
  useIsWhitelistedVault,
  useRewardVaultAddressesFromTokens,
  useRewardVaults,
} from "@bera/berajs";
import { MinimalPoolInListFragment } from "@bera/graphql/dex/api";
import {
  DataTableColumnHeader,
  FormattedNumber,
  useAsyncTable,
} from "@bera/shared-ui";

import { POLLING } from "~/utils/constants";
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

  // Fetch reward vault addresses from token addresses
  const tokenAddresses = useMemo(
    () => pools?.map((pool) => pool.address) || [],
    [pools],
  );

  // Pull vault addresses from the token addresses via multicall on the reward vault factory
  const { data: rewardVaultsAddressMap } = useRewardVaultAddressesFromTokens({
    tokenAddresses,
  });

  const vaultAddresses = useMemo(
    () =>
      Object.values(rewardVaultsAddressMap ?? {}).filter(
        (v) => v !== ADDRESS_ZERO,
      ),
    [rewardVaultsAddressMap],
  );

  // Pull isWhitelisted via multicall on the vault addresses we got
  // NOTE: we prefer to pull isWhitelisted on-chain for availability reasons.
  const { data: whitelistedVaultsAddressMap } =
    useIsWhitelistedVault(vaultAddresses);

  // Pull full Dynamic data etc from the vault via bex subgraph
  // FIXME: we will pull vault data from BE alongside pools to avoid these extra calls
  const { data: rewardVaultMetadata } = useRewardVaults(
    // TODO (BFE-444): this should use pagination / an index since this will become a performance issue when we have many pools.
    // {
    //   where: {
    //     vaultAddressIn: vaultAddresses,
    //   },
    // },
    {},
    { opts: { refreshInterval: POLLING.SLOW } },
  );
  const gaugeDictionary = rewardVaultMetadata?.gaugeDictionary ?? {};

  // Combine pools and vaults into unified data structure
  const unifiedData = useMemo(() => {
    if (!pools) return [];
    return pools.map((pool) => {
      const rewardVaultAddress =
        rewardVaultsAddressMap?.[pool.address.toLowerCase()];
      const rewardVault = rewardVaultAddress
        ? gaugeDictionary[rewardVaultAddress.toLowerCase() as `0x${string}`]
        : null;

      return {
        pool,
        vault: rewardVault,
      };
    });
  }, [pools, rewardVaultsAddressMap, gaugeDictionary]);

  const table = useAsyncTable({
    data: unifiedData ?? [],
    fetchData: async () => {},
    additionalTableProps: {
      initialState: { sorting, pagination: { pageSize: 10, pageIndex: 0 } },
      manualPagination: false,
      manualSorting: false,
    },
    enablePagination: true,
    enableRowSelection: false,
    columns: [
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
          const { pool, vault } = row.original;
          let isWhitelistedVault = false;
          try {
            const rewardVault =
              rewardVaultsAddressMap?.[pool.address.toLowerCase()];
            isWhitelistedVault = rewardVault
              ? whitelistedVaultsAddressMap?.some(
                  (vault) =>
                    vault.address.toLowerCase() === rewardVault.toLowerCase() &&
                    vault.isWhitelisted,
                ) ?? false
              : false;
          } catch (e) {
            console.error(
              "Unable to fetch isWhitelistedVault from contract! Falling back to bex api...",
              e,
            );
            isWhitelistedVault = vault?.isVaultWhitelisted ?? false; // NOTE: this is the gql way as a fallback
          }
          return (
            <div className="flex items-center gap-2">
              <PoolSummary
                pool={pool}
                isWhitelistedVault={isWhitelistedVault}
              />
            </div>
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
                value={row.original.pool.dynamicData?.totalLiquidity ?? 0}
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
            Number(rowA.original.pool.dynamicData?.totalLiquidity ?? "0") -
            Number(rowB.original.pool.dynamicData?.totalLiquidity ?? "0")
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
                value={row.original.pool.dynamicData?.fees24h ?? "0"}
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
            Number(rowA.original.pool.dynamicData?.fees24h ?? "0") -
            Number(rowB.original.pool.dynamicData?.fees24h ?? "0")
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
                value={row.original.pool.dynamicData?.volume24h ?? "0"}
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
            Number(rowA.original.pool.dynamicData?.volume24h ?? "0") -
            Number(rowB.original.pool.dynamicData?.volume24h ?? "0")
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
                row.original.pool.dynamicData?.aprItems?.at(0)?.apr === 0
                  ? "text-info-foreground"
                  : "text-warning-foreground"
              }`}
            >
              <FormattedNumber
                value={
                  row.original.pool.dynamicData?.aprItems
                    ?.at(0)
                    ?.apr?.toString() ?? "0"
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
            Number(
              rowA.original.pool.dynamicData?.aprItems?.at(0)?.apr ?? "0",
            ) -
            Number(rowB.original.pool.dynamicData?.aprItems?.at(0)?.apr ?? "0")
          );
        },
      },
      {
        accessorKey: "vault.dynamicData.apy",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Vault APY"
            className="whitespace-nowrap"
          />
        ),
        cell: ({ row }) => {
          const { vault } = row.original;
          const apy = vault?.dynamicData?.apy;

          return (
            <div className="flex flex-col gap-1">
              <div className="text-sm leading-5">
                {apy !== undefined && apy !== null ? (
                  <FormattedNumber
                    value={apy}
                    percent
                    compact
                    showIsSmallerThanMin
                  />
                ) : (
                  "—" // Placeholder for missing APY data
                )}
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
    ],
  });

  return {
    data: unifiedData,
    table,
    search,
    setSearch,
    isLoading: isPoolsLoading,
    handleEnter,
    keyword,
    setKeyword,
  };
};
