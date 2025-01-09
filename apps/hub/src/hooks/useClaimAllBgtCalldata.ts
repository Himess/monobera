import React from "react";
import { rewardVaultAbi, useBeraJs } from "@bera/berajs";
import { Address, encodeFunctionData } from "viem";

export const useClaimAllBgtCalldata = (vaultAddresses: Address[]) => {
  const { account } = useBeraJs();
  return React.useMemo(() => {
    const calls: any[] = vaultAddresses.map((vaultAddress) => {
      const data = encodeFunctionData({
        abi: rewardVaultAbi,
        functionName: "getReward",
        args: [account!, account!], // TODO: A second param is needed here for recipient. Added current account twice for now
      });
      return {
        target: vaultAddress as Address,
        callData: data,
      };
    });
    return calls;
  }, [...vaultAddresses, account]);
};
