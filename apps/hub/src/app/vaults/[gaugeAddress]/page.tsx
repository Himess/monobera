import React from "react";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { isIPFS } from "@bera/config";
import {
  Address,
  PublicClient,
  createPublicClient,
  http,
  isAddress,
} from "viem";
import { VaultDetails } from "./components/VaultDetails";
import { defaultBeraNetworkConfig } from "@bera/wagmi/config";

import {
  getRewardVault,
  getRewardVaultStakingToken,
} from "@bera/berajs/actions";
import { ApiVaultFragment } from "@bera/graphql/pol/api";

export function generateMetadata(): Metadata {
  return {
    title: "Reward Vault",
  };
}

export const dynamicParams = true;

export const revalidate = 30;

export default async function PoolPage({
  params,
}: {
  params: { gaugeAddress: Address };
}) {
  if (isIPFS) {
    return null;
  }

  if (!isAddress(params.gaugeAddress)) {
    console.error("Invalid gauge address", params.gaugeAddress);
    notFound();
  }

  const publicClient = createPublicClient({
    // @ts-ignore viem types
    chain: defaultBeraNetworkConfig.chain,
    transport: http(),
  });

  const vaultPromise = getRewardVault(params.gaugeAddress);

  try {
    await getRewardVaultStakingToken({
      address: params.gaugeAddress,
      // @ts-ignore viem types
      publicClient: publicClient as PublicClient,
    });
  } catch (error) {
    console.error("Stake token address not found, so vault is invalid", error);
    return notFound();
  }

  let rewardVault: ApiVaultFragment | undefined;

  try {
    rewardVault = await vaultPromise;
  } catch (error) {
    console.warn(
      "Vault not found during SSR, but staking token was found",
      params.gaugeAddress,
    );
  }

  return (
    <VaultDetails address={params.gaugeAddress} rewardVault={rewardVault} />
  );
}

export function generateStaticParams() {
  return [
    {
      gaugeAddress: "0x",
    },
  ];
}
