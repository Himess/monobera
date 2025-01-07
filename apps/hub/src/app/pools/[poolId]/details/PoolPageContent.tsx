"use client";

import React, { ComponentProps, ReactNode, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ADDRESS_ZERO,
  SWRFallback,
  truncateHash,
  useBeraJs,
  usePollBalance,
  useRewardVault,
  useRewardVaultBalanceFromStakingToken,
} from "@bera/berajs";
import { beraTokenAddress, blockExplorerUrl } from "@bera/config";
import { GqlPoolEventType } from "@bera/graphql/dex/api";
import {
  FormattedNumber,
  PoolHeader,
  TokenIcon,
  TokenIconList,
  getRewardsVaultUrl,
} from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { Card, CardContent } from "@bera/ui/card";
import { Icons } from "@bera/ui/icons";
import { Separator } from "@bera/ui/separator";
import { Skeleton } from "@bera/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@bera/ui/tabs";
import { unstable_serialize } from "swr";
import { Address, formatUnits } from "viem";

import { usePool } from "~/b-sdk/usePool";
import { usePoolUserPosition } from "~/b-sdk/usePoolUserPosition";
import { getPoolAddLiquidityUrl, getPoolWithdrawUrl } from "../../fetchPools";
import { PoolChart } from "./PoolChart";
import { PoolCreateRewardVault } from "./PoolCreateRewardVault";
import { EventTable } from "./PoolEventTable";

enum Selection {
  AllTransactions = "allTransactions",
  Swaps = "swaps",
  AddsWithdrawals = "addsWithdrawals",
}

const poolTypeLabels = {
  ComposableStable: "Stable",
  MetaStable: "Meta Stable",
  Weighted: "Weighted",
};

const TokenView = ({
  tokens,
  isLoading,
  showWeights,
}: {
  showWeights?: boolean;
  tokens: {
    address: string;
    symbol: string;
    value: string | number;
    valueUSD?: string | number | null;
    weight?: string | number;
  }[];
  isLoading: boolean;
}) => {
  return (
    <>
      <div>
        {isLoading ? (
          <div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="mt-2 h-8 w-full" />
          </div>
        ) : (
          tokens.map((token, index) => {
            return (
              <div
                className="flex h-8 items-center justify-between"
                key={`token-list-${index}-${token.address}-${token.value}`}
              >
                <div className=" flex gap-1">
                  <TokenIcon address={token.address} symbol={token.symbol} />
                  <a
                    href={
                      token.address
                        ? `${blockExplorerUrl}/address/${token.address}`
                        : "#"
                    }
                    target="_blank"
                    className="ml-1 font-medium uppercase hover:underline"
                    rel="noreferrer"
                  >
                    {token.address === beraTokenAddress
                      ? "wbera"
                      : token.symbol}
                  </a>{" "}
                  {showWeights && token.weight && (
                    <span className="ml-2 text-muted-foreground">
                      {(Number(token.weight) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="font-medium">
                    <FormattedNumber value={token.value} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {!token.valueUSD ? (
                      "–"
                    ) : (
                      <FormattedNumber
                        value={token.valueUSD ?? 0}
                        symbol="USD"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export const PoolPageWrapper = ({
  children,
  pool,
}: {
  children: React.ReactNode;
  pool: any | undefined;
}) => {
  return (
    <SWRFallback
      fallback={
        pool
          ? { [unstable_serialize(`usePool-subgraph-${pool?.id}`)]: pool }
          : {}
      }
    >
      {children}
    </SWRFallback>
  );
};
export default function PoolPageContent({ poolId }: { poolId: string }) {
  const {
    data: [pool, v3Pool] = [],
    isLoading: isPoolLoading,
  } = usePool({
    poolId,
  });
  const { isConnected } = useBeraJs();

  const { data: userLpBalance, isLoading: isUserLpBalanceLoading } =
    usePollBalance({
      address: pool?.address,
    });

  const tvlInUsd = pool
    ? pool?.totalLiquidity
      ? Number(pool?.totalLiquidity ?? 0)
      : null
    : undefined;

  const { data: userPositionBreakdown } = usePoolUserPosition({ pool: pool });

  // NOTE: this is on-chain
  const {
    data: rewardVault,
    refresh: refreshRewardVault,
    isLoading: isLoadingRewardVaultOnChain,
    error: errorLoadingRewardVault,
  } = useRewardVaultBalanceFromStakingToken({
    stakingToken: pool?.address as Address,
  });

  if (errorLoadingRewardVault) {
    console.error("Error loading reward vault", errorLoadingRewardVault);
  }

  // NOTE: we could instead pull the v3Pool from bex API? (it has rewardVault inside unlike v3Pool)
  const { data: gauge, isLoading: isLoadingRewardVaultSubGraph } =
    useRewardVault(rewardVault?.address as Address);
  const userSharePercentage = userPositionBreakdown?.userSharePercentage ?? 0;

  const isVaultExists = rewardVault && rewardVault.address !== ADDRESS_ZERO;
  const isLoadingRewardVault =
    isLoadingRewardVaultOnChain ||
    isLoadingRewardVaultSubGraph ||
    (isPoolLoading as boolean);

  const didUserDeposit =
    userSharePercentage || (rewardVault?.balance && rewardVault?.balance > 0n);

  const poolType =
    (pool?.type ?? "") in poolTypeLabels
      ? poolTypeLabels[pool?.type as keyof typeof poolTypeLabels]
      : undefined;

  const cards: ({ label: string } & ComponentProps<typeof FormattedNumber>)[] =
    [
      {
        label: "TVL",
        value: tvlInUsd ?? 0,
        symbol: "USD",
      },
      {
        label: "Volume (24h)",
        value: v3Pool?.volume24h ?? 0,
        symbol: "USD",
      },
      {
        label: "Fees (24h)",
        value: v3Pool?.fees24h ?? 0,
        symbol: "USD",
      },
      {
        label: "Pool APR",
        value: v3Pool?.aprItems.at(0)?.apr ?? 0,
        colored: true,
        percent: true,
      },
    ];

  const tabs: [Selection, string, ReactNode][] = [
    [
      Selection.AllTransactions,
      "All transactions",
      <EventTable pool={pool} isLoading={isPoolLoading} />,
    ],
    [
      Selection.Swaps,
      "Swaps",
      <EventTable
        pool={pool}
        types={[GqlPoolEventType.Swap]}
        isLoading={isPoolLoading}
      />,
    ],
    [
      Selection.AddsWithdrawals,
      "Adds & Withdraws",
      <EventTable
        pool={pool}
        types={[GqlPoolEventType.Add, GqlPoolEventType.Remove]}
        isLoading={isPoolLoading}
      />,
    ],
  ];

  // FIXME we should share a function but the way we fetch doesnt align here with PoolsTable
  const effectiveApy = useMemo(() => {
    return (
      Number(v3Pool?.aprItems.at(0)?.apr ?? 0) +
      Number(gauge?.dynamicData?.apy ?? 0) / 100
    );
  }, [v3Pool, gauge]);

  return (
    <div className="flex flex-col gap-8">
      <PoolHeader
        backHref="/pools/"
        title={
          pool ? (
            <>
              <TokenIconList
                tokenList={
                  pool?.tokens
                    ?.filter((t) => t.address !== pool.address)
                    .map((t) => ({
                      address: t.address as Address,
                      symbol: t.symbol!,
                      decimals: t.decimals!,
                      name: t.symbol!,
                    })) ?? []
                }
                size="xl"
              />
              {pool?.name}
            </>
          ) : (
            <Skeleton className="h-10 w-40" />
          )
        }
        subtitles={[
          {
            title: "Type",
            content: poolType,
          },
          {
            title: "Fee",
            content: pool ? (
              <FormattedNumber
                suffixText="%"
                value={Number(pool?.swapFee ?? 0) * 100}
              />
            ) : (
              <Skeleton className="h-4 w-8" />
            ),
          },
          {
            title: "Pool Contract",
            content: pool ? (
              truncateHash(pool?.address ?? "")
            ) : (
              <Skeleton className="h-4 w-16" />
            ),
            externalLink: `${blockExplorerUrl}/address/${pool?.address}`,
          },
        ]}
      />
      <Separator />
      <div className="grid w-full auto-rows-min grid-cols-1 gap-4 lg:grid-cols-12 ">
        <div className="row-start-1 grid auto-rows-min grid-cols-1 gap-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
          {isConnected && (
            <Card>
              <CardContent className="flex h-full flex-col items-center justify-between gap-4 p-4">
                <div className="flex h-8 w-full items-center justify-between text-lg font-semibold">
                  <h3 className="text-md font-semibold capitalize">
                    My deposits
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      as={Link}
                      href={getPoolAddLiquidityUrl(pool)}
                    >
                      Deposit
                    </Button>
                    {userSharePercentage ? (
                      <Button
                        variant="outline"
                        size="md"
                        as={Link}
                        href={getPoolWithdrawUrl(pool)}
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                </div>
                {didUserDeposit ? (
                  <>
                    <div className="mt-4 grow self-stretch">
                      <TokenView
                        isLoading={
                          (!userLpBalance && isUserLpBalanceLoading) ||
                          isPoolLoading
                        }
                        tokens={
                          pool?.tokens
                            ?.filter((t) => t.address !== pool.address)
                            ?.map((t) => ({
                              address: t.address!,
                              symbol: t.symbol!,
                              value:
                                parseFloat(t.balance) * userSharePercentage,
                              valueUSD:
                                parseFloat(t.balance) *
                                parseFloat(t.token?.latestUSDPrice ?? "0") *
                                userSharePercentage,
                            })) ?? []
                        }
                      />
                    </div>
                    <div className="flex w-full justify-between font-medium">
                      <span>Total</span>
                      {isUserLpBalanceLoading || tvlInUsd === undefined ? (
                        <Skeleton className="h-[32px] w-[150px]" />
                      ) : tvlInUsd === null ? (
                        "–"
                      ) : (
                        <FormattedNumber
                          value={tvlInUsd * userSharePercentage}
                          symbol="USD"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-muted-foreground">
                    <div className="mb-2 flex gap-2">
                      <h4>Earn APY</h4>
                      <FormattedNumber
                        className="font-semibold text-green-500"
                        percent
                        value={effectiveApy}
                      />
                    </div>
                    <p className="max-w-48">
                      You have no current deposits in this pool
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {isLoadingRewardVault || errorLoadingRewardVault ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex w-full justify-between">
                  <h3 className="text-md font-semibold capitalize">
                    Reward Vault
                  </h3>
                  <div className="flex items-center text-muted-foreground">
                    Loading...
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isVaultExists ? (
            <>
              {isConnected && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex w-full items-center justify-between text-lg font-semibold">
                      <h3 className="text-md font-semibold capitalize">
                        Receipt Tokens
                      </h3>
                      {didUserDeposit && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="block disabled:pointer-events-none disabled:opacity-50"
                            size="md"
                            disabled={userLpBalance?.balance === 0n}
                            as={Link}
                            href={getRewardsVaultUrl(
                              rewardVault.address ?? "0x",
                            )}
                          >
                            Stake
                          </Button>
                          <Button
                            variant="outline"
                            className="block"
                            size="md"
                            disabled={rewardVault.balance === 0n}
                            as={Link}
                            href={getRewardsVaultUrl(
                              rewardVault.address ?? "0x",
                            )}
                          >
                            Unstake
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grow self-stretch font-medium">
                      <div className="flex w-full justify-between">
                        <h4 className="font-semibold">Available</h4>
                        <FormattedNumber
                          className="text-muted-foreground"
                          value={
                            didUserDeposit
                              ? userLpBalance?.formattedBalance ?? 0
                              : 0
                          }
                        />
                      </div>
                      <div className="flex w-full justify-between">
                        <h4 className="font-semibold">Staked</h4>
                        <FormattedNumber
                          className="text-muted-foreground"
                          value={
                            didUserDeposit
                              ? formatUnits(
                                  BigInt(rewardVault.balance ?? "0"),
                                  userLpBalance?.decimals ?? 18,
                                )
                              : 0
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* NOTE: we display the Vault even if you are not connected */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex w-full justify-between">
                    <div>
                      <h3 className="text-md font-semibold capitalize">
                        Reward Vault
                      </h3>
                      <div className="flex w-fit items-center gap-1 text-sm">
                        <Link
                          href={getRewardsVaultUrl(rewardVault.address ?? "")}
                          className="align-middle hover:underline"
                        >
                          <span>{truncateHash(rewardVault.address ?? "")}</span>{" "}
                          <Icons.externalLink className="inline-block h-3 w-3 text-muted-foreground" />
                        </Link>
                      </div>
                    </div>
                    {rewardVault.isWhitelisted ? (
                      <div>
                        <h4 className="font-semibold">BGT APY</h4>
                        <p className="font-semibold text-success-foreground">
                          {gauge ? (
                            <FormattedNumber
                              compact={false}
                              compactThreshold={999_999_999}
                              percent
                              value={Number(gauge.dynamicData?.apy) / 100 ?? 0}
                            />
                          ) : (
                            "–"
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center text-muted-foreground">
                        Not whitelisted
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // If no vault exists and we are connected, and the pool exists, we will allow user to create a vault.
            isConnected &&
            pool?.address && (
              <PoolCreateRewardVault
                onSuccess={() => refreshRewardVault()}
                address={pool.address as Address}
              />
            )
          )}
        </div>

        <div className="grid auto-rows-auto grid-cols-1 gap-4 lg:col-span-7 lg:col-start-1">
          <PoolChart
            pool={pool}
            currentTvl={tvlInUsd}
            timeCreated={pool?.createTime}
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card, index) => (
              <Card className="px-4 py-2" key={`${card.label}-${index}`}>
                <div className="flex flex-row items-center justify-between">
                  <div className="overflow-hidden truncate whitespace-nowrap text-sm ">
                    {card.label}
                  </div>
                </div>
                <div className="overflow-hidden truncate whitespace-nowrap text-lg font-semibold">
                  {card.value !== null ? (
                    <FormattedNumber value={card.value ?? 0} symbol="USD" />
                  ) : (
                    "–"
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-4">
            <div className="mb-4 flex h-8 w-full items-center justify-between text-lg font-semibold">
              Pool Liquidity
              <div className="text-2xl">
                {pool === undefined ? (
                  <Skeleton className="h-10 w-20" />
                ) : tvlInUsd === null ? (
                  "–"
                ) : (
                  <FormattedNumber value={tvlInUsd ?? 0} symbol="USD" />
                )}
              </div>
            </div>
            <TokenView
              showWeights
              isLoading={pool === undefined}
              tokens={
                pool?.tokens
                  ?.filter((t) => t.address !== pool.address)
                  .map((t) => ({
                    address: t.address!,
                    symbol: t.symbol!,
                    weight: t.weight,
                    value: parseFloat(t.balance),
                    valueUSD: t.token?.latestUSDPrice
                      ? parseFloat(t.balance) *
                        parseFloat(t.token?.latestUSDPrice ?? "0")
                      : null,
                  })) ?? []
              }
            />
          </Card>
        </div>
      </div>
      <Separator />
      <section>
        <Tabs defaultValue={Selection.AllTransactions}>
          <TabsList className="w-full" variant="compact">
            {tabs.map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="w-full text-xs sm:text-sm"
                variant="compact"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Card className="mt-4">
            {tabs.map(([value, _label, content]) => (
              <TabsContent
                value={value}
                className="mt-0 overflow-x-auto"
                key={value}
              >
                {content}
              </TabsContent>
            ))}
          </Card>
        </Tabs>
      </section>
    </div>
  );
}
