import { useState } from "react";
import {
  rewardVaultAbi,
  TransactionActionType,
  usePollAllowance,
  usePollVaultsInfo,
  useTokenInformation,
  usePollBalance,
} from "@bera/berajs";

import {
  ActionButton,
  ApproveButton,
  TokenInput,
  useAnalytics,
  useTxn,
} from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import BigNumber from "bignumber.js";
import { Address, parseUnits } from "viem";
import { ApiVaultFragment } from "@bera/graphql/pol/api";

export const DepositLP = ({
  rewardVault,
}: {
  rewardVault: ApiVaultFragment;
}) => {
  const { data: lpToken } = useTokenInformation({
    address: rewardVault.stakingToken.address,
  });

  const { data: balance, refresh: refreshWalletBalances } = usePollBalance({
    address: lpToken?.address,
  });

  const [depositAmount, setDepositAmount] = useState("");
  const validAmount =
    BigNumber(depositAmount).gt(0) &&
    BigNumber(depositAmount).lte(balance?.formattedBalance ?? "0");

  const { refresh: refreshVaultInfo } = usePollVaultsInfo({
    vaultAddress: rewardVault.vaultAddress as Address,
  });

  const { captureException, track } = useAnalytics();

  const { write, ModalPortal } = useTxn({
    message: "Stake LP Tokens", // AKA 'stake'
    actionType: TransactionActionType.ADD_LIQUIDITY,
    onSuccess: () => {
      try {
        track("stake", {
          quantity: depositAmount,
          token: lpToken?.symbol,
          vault: rewardVault.vaultAddress,
        });
        setDepositAmount("");
      } catch (e) {
        captureException(e);
      }
      refreshWalletBalances();
      refreshVaultInfo();
    },
    onError: (e: Error | undefined) => {
      track("stake_failed");
      captureException(e);
    },
  });

  const { data: allowance } = usePollAllowance({
    spender: rewardVault.vaultAddress as Address,
    token: lpToken,
  });

  const [exceeding, setExceeding] = useState(false);

  const needsApproval =
    lpToken &&
    ((allowance !== undefined && allowance?.formattedAllowance === "0") ||
      (allowance?.allowance ?? 0n) <
        parseUnits(depositAmount, lpToken.decimals)) &&
    depositAmount !== "" &&
    depositAmount !== "0" &&
    !exceeding;

  return (
    <div className="rounded-md border border-border p-4">
      <div>
        <div className="text-xl font-semibold leading-none">Stake</div>

        <div className="my-6">
          <TokenInput
            selected={lpToken}
            amount={depositAmount}
            balance={balance?.formattedBalance}
            hidePrice
            className="!p-0"
            showExceeding={true}
            selectable={false}
            setAmount={(amount: string) =>
              setDepositAmount(amount as `${number}`)
            }
            onExceeding={(exceeding) => setExceeding(exceeding)}
          />
        </div>
      </div>

      <ActionButton>
        {needsApproval ? (
          <ApproveButton
            token={lpToken}
            disabled={!lpToken}
            spender={rewardVault.vaultAddress as Address}
            amount={parseUnits(depositAmount, lpToken!.decimals)}
          />
        ) : (
          <Button
            className="w-full"
            disabled={!validAmount || exceeding || !lpToken}
            onClick={() =>
              write({
                address: rewardVault.vaultAddress as Address,
                abi: rewardVaultAbi,
                functionName: "stake",
                params: [parseUnits(depositAmount, lpToken!.decimals)],
              })
            }
          >
            Stake
          </Button>
        )}
      </ActionButton>
      {ModalPortal}
    </div>
  );
};
