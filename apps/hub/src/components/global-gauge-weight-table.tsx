"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRewardVaults } from "@bera/berajs";
import {
  SimpleTable,
  getRewardsVaultUrl,
  useAsyncTable,
} from "@bera/shared-ui";
import type {
  PaginationState,
  SortingState,
  TableState,
  Updater,
} from "@tanstack/react-table";

import { AllRewardVaultColumns } from "~/columns/global-gauge-weight-columns";

import {
  REWARD_VAULTS_PAGE_SIZE,
  getRewardVaultsFilter,
} from "./getRewardVaultsFilter";

export default function GlobalGaugeWeightTable({
  myGauge = false,
  keywords = "",
  markets = [],
  isTyping = false,
}: {
  myGauge?: boolean;
  keywords?: string;
  markets?: string[];
  isTyping?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    // Set page to 0 if markets change to avoid showing empty page
    setPage(0);
  }, [markets]);

  const { data, isLoading, isValidating } = useRewardVaults(
    getRewardVaultsFilter(
      sorting,
      page,
      REWARD_VAULTS_PAGE_SIZE,
      isTyping ? "" : keywords,
    ),
    { opts: { keepPreviousData: true } },
  );

  const gaugeList = data?.gaugeList ?? [];
  const gaugeCounts = data?.gaugeCounts ?? 0;

  const fetchData = useCallback(
    (state: TableState) => {
      setPage(state?.pagination?.pageIndex);

      setSorting(
        state?.sorting.map((s) => ({
          id: s.id,
          desc: s.desc,
        })),
      );
    },
    [setPage],
  );

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      setSorting((prev: SortingState) => {
        return typeof updater === "function" ? updater(prev ?? []) : updater;
      });
    },
    [setSorting],
  );

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      setPage((prev: number) => {
        const newPaginationState =
          typeof updater === "function"
            ? updater({
                pageIndex: prev ?? 0,
                pageSize: REWARD_VAULTS_PAGE_SIZE,
              })
            : updater;
        return newPaginationState.pageIndex ?? 0;
      });
    },
    [setPage],
  );

  const allGaugeTable = useAsyncTable({
    fetchData: fetchData,
    columns: AllRewardVaultColumns,
    data: myGauge ? [] : gaugeList ?? [],
    enablePagination: true,
    additionalTableProps: {
      meta: {
        loading: isLoading,
        loadingText: "Loading...",
        validating: isValidating,
      },
      state: {
        pagination: {
          pageIndex: page,
          pageSize: REWARD_VAULTS_PAGE_SIZE,
        },
        sorting,
      },
      manualSorting: true,
      manualPagination: true,
      autoResetPageIndex: false,
      pageCount: Math.ceil(gaugeCounts / REWARD_VAULTS_PAGE_SIZE),
      onPaginationChange: handlePaginationChange,
      onSortingChange: handleSortingChange,
    },
  });

  return (
    <SimpleTable
      table={allGaugeTable}
      className="min-h-[200px] shadow overflow-x-scroll max-w-full"
      wrapperClassName="min-h-[200px]"
      variant="ghost"
      mutedBackgroundOnHead={false}
      flexTable
      onRowClick={(row: any) =>
        router.push(getRewardsVaultUrl(row.original.vaultAddress, myGauge))
      }
    />
  );
}
