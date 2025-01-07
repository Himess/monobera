import {
  useAllValidators,
  usePollValidatorAllBlockStats,
  useTokenHoneyPrices,
} from "@bera/berajs";
import { FormattedNumber, Tooltip } from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Card } from "@bera/ui/card";
import { Icons } from "@bera/ui/icons";
import { Skeleton } from "@bera/ui/skeleton";
import { type Address } from "viem";
import { UserBoosts } from "./UserBoosts";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";
import { useEffect, useState } from "react";
import { isSameAddress } from "@berachain-foundation/berancer-sdk";
import { beraTokenAddress } from "@bera/config";

export const ValidatorDataCard = ({
  title,
  value,
  tooltipText,
  className,
}: {
  title: string;
  value: React.ReactNode;
  tooltipText?: string | undefined;
  className?: string;
}) => {
  return (
    <Card className={cn(className, "p-5")}>
      <div className="flex w-full items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-foreground">
        {title}
        {tooltipText && <Tooltip text={tooltipText} />}
      </div>
      <div className="mt-2 text-foreground">{value}</div>
    </Card>
  );
};

export const ValidatorOverview = ({
  validator,
}: { validator: ApiValidatorFragment }) => {
  const activeIncentivesArray = validator.rewardAllocationWeights?.flatMap(
    (rv) => rv.receivingVault?.activeIncentives,
  );

  const [rank, setRank] = useState<{
    validatorRank: number;
    totalValidatorsCount: number;
    blockSigningRank: number;
    blocksSigned: number;
    totalBlocks: number;
    isLoading: boolean;
  }>({
    validatorRank: -1,
    totalValidatorsCount: 0,
    blockSigningRank: -1,
    blocksSigned: 0,
    totalBlocks: 0,
    isLoading: true,
  });

  const {
    data: allValidatorBlockData,
    isLoading: isLoadingAllValidatorBlockData,
  } = usePollValidatorAllBlockStats();

  const { data: allValidators, isLoading: isLoadingAllValidators } =
    useAllValidators();

  useEffect(() => {
    const totalValidatorsCount =
      allValidators?.validators?.validators?.length ?? 0;
    const valStakedRanking = allValidators?.validators?.validators?.findIndex(
      (v) => v.id === validator.id.toLowerCase(),
    );

    const blocksSigned = allValidatorBlockData?.blockStatsByValidators?.reduce(
      (acc, v, idx) => {
        if (isSameAddress(v.validator.id, validator.id as Address)) {
          return {
            ...acc,
            rank: idx,
            blocksSigned: Number(v.blockCount),
            totalBlocks: acc.totalBlocks + Number(v.blockCount),
          };
        }

        return { ...acc, totalBlocks: acc.totalBlocks + Number(v.blockCount) };
      },
      {
        rank: -1,
        blocksSigned: 0,
        totalBlocks: 0,
      },
    );

    setRank({
      validatorRank: valStakedRanking ?? -1,
      totalValidatorsCount,
      blockSigningRank: blocksSigned?.rank ?? -1,
      blocksSigned: blocksSigned?.blocksSigned ?? 0,
      totalBlocks: blocksSigned?.totalBlocks ?? 0,
      isLoading:
        allValidatorBlockData === undefined || allValidators === undefined,
    });
  }, [validator.id, allValidatorBlockData, allValidators]);

  const activeIncentivesTokens = activeIncentivesArray?.filter(
    (incentive, index, array) =>
      incentive?.token &&
      incentive?.active &&
      array.findIndex(
        (i) => i?.token?.address === incentive?.token?.address,
      ) === index,
  );

  const { data: tokenHoneyPrices } = useTokenHoneyPrices({
    tokenAddresses: activeIncentivesTokens
      ?.map((t) => t?.token?.address)
      .filter((t) => t !== undefined)
      .concat([beraTokenAddress]) as Address[],
  });

  const returnPerBgt: number = validator.rewardAllocationWeights?.reduce(
    (acc: number, ab) => {
      if (!ab) return acc;
      const totalIncentiveValue =
        ab.receivingVault?.activeIncentives.reduce(
          (totalIncentiveValue, currIncentive) => {
            const tokenPrice = parseFloat(
              tokenHoneyPrices?.[currIncentive.token.address] ?? "0",
            );
            return (
              totalIncentiveValue +
              Number(currIncentive.incentiveRate) * tokenPrice
            );
          },
          0,
        ) ?? 0;

      return acc + (totalIncentiveValue * ab.percentageNumerator) / 1e4;
    },
    0,
  );

  const isLoadingReturnPerBgt = !validator || tokenHoneyPrices === undefined;

  const isLoadingBoostApy =
    !validator.dynamicData || isLoadingReturnPerBgt || isLoadingAllValidators;

  const boostApy =
    (returnPerBgt *
      Number(validator.dynamicData?.lastDayDistributedBGTAmount ?? 0) *
      365) /
    (Number(validator.dynamicData?.activeBoostAmount ?? 0) *
      Number(tokenHoneyPrices?.[beraTokenAddress] ?? 0));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="flex flex-col gap-2">
        {/* TODO: Binary Version?!? */}
        {/* <div className="flex justify-end text-sm text-muted-foreground">
          {"Binary Version: V9.41"}
        </div> */}
        <div className="grid w-full grid-cols-1 gap-x-0 gap-y-4 md:grid-cols-2 md:gap-x-4">
          <ValidatorDataCard
            className="h-[130px]"
            title="Validator Ranking"
            value={
              <div className="flex flex-col items-start gap-1">
                <div className="relative flex w-full flex-row justify-between">
                  {isLoadingAllValidators || rank.validatorRank === -1 ? (
                    <Skeleton className="mt-1 h-8 w-40" />
                  ) : (
                    <span className="text-2xl font-semibold">
                      {rank.validatorRank === -1
                        ? "Unranked"
                        : `${rank.validatorRank + 1} of ${
                            rank.totalValidatorsCount
                          }`}
                    </span>
                  )}
                  <Icons.logo className="absolute right-0 h-16 w-16 self-center text-muted" />
                </div>
              </div>
            }
          />
          <ValidatorDataCard
            className="h-[130px]"
            title="Block Signing Rate"
            value={
              <div className="flex flex-col items-start gap-1">
                <div className="relative flex w-full flex-row justify-between">
                  {rank.isLoading ? (
                    <Skeleton className="mt-1 h-8 w-40" />
                  ) : (
                    <span className="text-2xl font-semibold">
                      <FormattedNumber
                        value={rank.blocksSigned / rank.totalBlocks}
                        compact
                        percent
                        showIsSmallerThanMin
                      />
                    </span>
                  )}
                  <Icons.cube className="absolute right-0 h-16 w-16 self-center text-muted" />
                </div>

                {rank.isLoading ? (
                  <Skeleton className="mt-1 h-4 w-12" />
                ) : (
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground">
                    Last day:{" "}
                    <FormattedNumber
                      value={rank.blocksSigned}
                      compact
                      showIsSmallerThanMin
                    />{" "}
                    /{" "}
                    <FormattedNumber
                      value={rank.totalBlocks}
                      compact
                      showIsSmallerThanMin
                    />
                  </span>
                )}
              </div>
            }
          />
          <ValidatorDataCard
            className="h-[130px]"
            title="Boost APY"
            tooltipText="Total value of incentives distributed in 24 hours on the total BGT boost (annualized)"
            value={
              <div className="flex flex-col items-start gap-1">
                <div className="w-full text-2xl font-semibold">
                  {isLoadingBoostApy ? (
                    <Skeleton className="mt-1 h-[1em]" />
                  ) : (
                    <FormattedNumber value={boostApy} percent />
                  )}
                </div>
              </div>
            }
          />
          <ValidatorDataCard
            className="h-[130px]"
            title="Est. Return per BGT"
            value={
              <div className="flex flex-row gap-1 text-2xl font-semibold">
                {isLoadingReturnPerBgt ? (
                  <Skeleton className="mt-1 w-8 h-[1em]" />
                ) : (
                  <>
                    <FormattedNumber
                      value={returnPerBgt}
                      compact
                      showIsSmallerThanMin
                    />
                    <Icons.honey className="h-6 w-6 self-center" />
                  </>
                )}
              </div>
            }
          />
        </div>
        {/* TODO: Uptime need work on beaconkit to add */}
        {/* <Uptime address={validator.id} /> */}
      </div>
      <UserBoosts validator={validator} />
    </div>
  );
};
