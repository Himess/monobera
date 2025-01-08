"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADDRESS_ZERO,
  useRewardVaultFromToken,
  useStakingTokenInformation,
} from "@bera/berajs";
import { FormattedNumber, Spinner, Tooltip } from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@bera/ui/card";
import { Icons } from "@bera/ui/icons";
import { InputWithLabel } from "@bera/ui/input";
import { Address, isAddress } from "viem";
import { useCreateRewardVault } from "./useCreateRewardVault";

export const CreateGaugeCard: React.FC = () => {
  const [targetAddress, setTargetAddress] = useState("");

  const {
    data: rewardVault,
    isLoading: isLoadingRewardVault,
    mutate,
  } = useRewardVaultFromToken({
    tokenAddress: targetAddress as Address,
  });

  const { createRewardVault, ModalPortal } = useCreateRewardVault({
    tokenAddress: targetAddress as Address,
    onSuccess: () => mutate(),
  });

  const { data: tokenInformation, error } = useStakingTokenInformation({
    address: targetAddress,
  });

  const router = useRouter();

  const doesExist = !!rewardVault && rewardVault !== ADDRESS_ZERO;

  return (
    <div>
      <Button
        variant={"ghost"}
        size="sm"
        className="flex items-center gap-1"
        onClick={() => router.back()}
      >
        <Icons.arrowLeft className="h-4 w-4" />
        <div className="text-sm font-medium">Go Back</div>
      </Button>
      <div className="flex justify-center align-middle">
        <span className="mb-6 gap-2 text-4xl font-bold">
          <Icons.logo className="inline-block" width={64} height={64} /> Rewards
          Vault
        </span>
      </div>
      <Card className="mx-auto mb-12 mt-4 w-full max-w-md">
        {ModalPortal}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create new Reward Vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputWithLabel
            label="Target Contract Address"
            placeholder="Enter the target address"
            id="targetAddress"
            value={targetAddress}
            loader={<Spinner size={16} color="white" />}
            isLoading={isLoadingRewardVault}
            onChange={(e) => setTargetAddress(e.target.value)}
            error={
              targetAddress
                ? !isAddress(targetAddress)
                  ? "Not a valid address"
                  : error
                    ? "Not a valid ERC20 contract"
                    : undefined
                : undefined
            }
          />
          <div className="grid grid-cols-3 gap-4 truncate">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Name
                <Tooltip
                  className="ml-1"
                  text="The Name of the Staking Token"
                />
              </label>
              <div className="w-full overflow-hidden">
                <span className="block truncate">
                  {tokenInformation?.name ?? "--"}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Token Amount
                <Tooltip
                  className="ml-1"
                  text="The Staking Token Amount of the Reward Vault"
                />
              </label>
              <div className="w-full overflow-hidden">
                {tokenInformation?.totalSupply ? (
                  <FormattedNumber
                    value={tokenInformation?.totalSupply || "0"}
                    symbol={tokenInformation?.symbol}
                  />
                ) : (
                  "--"
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
                <Tooltip
                  className="ml-1"
                  text="The status of the Reward Vault"
                />
              </label>
              <div className="flex items-center">
                {tokenInformation || isAddress(targetAddress) ? (
                  <>
                    <span
                      className={doesExist ? "text-red-500" : "text-green-500"}
                    >
                      {doesExist ? "Already exists" : "Available"}
                    </span>
                    {doesExist ? (
                      <Icons.xCircle className="ml-1 h-4 w-4 text-red-500" />
                    ) : (
                      <Icons.checkCircle className="ml-1 h-4 w-4 text-green-500" />
                    )}
                  </>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => createRewardVault()}
            disabled={
              isLoadingRewardVault ||
              !!doesExist ||
              !isAddress(targetAddress) ||
              !tokenInformation
            }
          >
            Create Reward Vault
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
