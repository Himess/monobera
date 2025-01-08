import { useState } from "react";
import {
  rewardVaultAbi,
  Token,
  TransactionActionType,
  usePollVaultsInfo,
  useTokenInformation,
} from "@bera/berajs";
import {
  ActionButton,
  TokenInput,
  useAnalytics,
  useTxn,
} from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { Slider } from "@bera/ui/slider";
import BigNumber from "bignumber.js";
import { Address, parseUnits } from "viem";
import { ApiVaultFragment } from "@bera/graphql/pol/api";

export const WithdrawLP = ({
  rewardVault,
}: {
  rewardVault: ApiVaultFragment;
}) => {
  const { data: lpToken } = useTokenInformation({
    address: rewardVault.stakingToken.address,
  });

  const [withdrawAmount, setWithdrawAmount] = useState<`${number}`>("0");
  const [withdrawPercent, setWithdrawPercent] = useState<number>(0);

  const { data, refresh } = usePollVaultsInfo({
    vaultAddress: rewardVault.vaultAddress as Address,
  });

  const validAmount =
    BigNumber(withdrawAmount).gt(0) &&
    BigNumber(withdrawAmount).lte(data?.balance ?? "0");

  const { captureException, track } = useAnalytics();
  const { write, ModalPortal } = useTxn({
    message: "Unstake LP Tokens", // aka unstake
    actionType: TransactionActionType.WITHDRAW_LIQUIDITY,
    onSuccess: () => {
      try {
        track("unstake", {
          quantity: withdrawAmount,
          token: lpToken!.symbol,
          vault: rewardVault.vaultAddress,
        });
      } catch (e) {
        captureException(e);
      }

      refresh();
    },
    onError: (e: Error | undefined) => {
      track("unstake_failed");
      captureException(e);
    },
  });

  return (
    <div className="rounded-md border border-border p-4">
      <div className="mt-2 mb-4">
        <TokenInput
          className="!p-0"
          selected={lpToken}
          amount={withdrawAmount}
          balance={data?.balance ?? "0"}
          hidePrice
          showExceeding={true}
          selectable={false}
          setAmount={(amount: string) => {
            setWithdrawAmount(amount as `${number}`);
            if (!data?.balance || BigNumber(data?.balance ?? "0").eq(0)) return;

            if (!amount) {
              setWithdrawPercent(0);
              return;
            }

            setWithdrawPercent(
              BigNumber(amount).div(data?.balance).times(100).toNumber(),
            );
          }}
        />
      </div>
      <div className="rounded-lg border p-4 my-4">
        <div className="flex w-full flex-row items-center justify-between gap-1">
          <p className="text-sm font-semibold sm:text-lg">
            {withdrawPercent.toFixed(2)}%
          </p>
          <div className="flex flex-row gap-2">
            {[25, 50, 75, 100].map((percent) => {
              return (
                <Button
                  key={percent.toString()}
                  variant={"secondary"}
                  size={"sm"}
                  className="w-full text-foreground"
                  onClick={() => {
                    setWithdrawPercent(percent);
                    setWithdrawAmount(
                      BigNumber(data?.balance ?? "0")
                        .times(percent)
                        .div(100)
                        .toString() as `${number}`,
                    );
                  }}
                >
                  {percent.toString()}%
                </Button>
              );
            })}
          </div>
        </div>
        <Slider
          defaultValue={[0]}
          value={[withdrawPercent]}
          max={100}
          min={0}
          onValueChange={(value: number[]) => {
            const percent = value[0] ?? 0;
            setWithdrawPercent(percent);
            setWithdrawAmount(
              BigNumber(data?.balance ?? "0")
                .times(percent)
                .div(100)
                .toString() as `${number}`,
            );
          }}
        />
      </div>
      {/* <Info /> */}
      <ActionButton>
        <Button
          className="w-full"
          disabled={!validAmount || !lpToken}
          onClick={() =>
            write({
              address: rewardVault.vaultAddress as Address,
              abi: rewardVaultAbi,
              functionName: "withdraw",
              params: [parseUnits(withdrawAmount, lpToken!.decimals)],
            })
          }
        >
          Unstake
        </Button>
      </ActionButton>
      {ModalPortal}
    </div>
  );
};
