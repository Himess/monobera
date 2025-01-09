import React from "react";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { isIPFS } from "@bera/config";
import { Address, PublicClient, isAddress } from "viem";
import { VaultDetails } from "./components/VaultDetails";

import {
  getRewardVault,
  getRewardVaultStakingToken,
} from "@bera/berajs/actions";
import { ApiVaultFragment } from "@bera/graphql/pol/api";
import { getServerSidePublicClient } from "~/utils/serverSidePublicClient";

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
  params: { address: Address };
}) {
  if (isIPFS) {
    return null;
  }

  if (!isAddress(params.address)) {
    console.error("Invalid gauge address", params.address);
    notFound();
  }

  const publicClient = await getServerSidePublicClient();
  const vaultPromise = getRewardVault(params.address);

  try {
    await getRewardVaultStakingToken({
      address: params.address,
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
      params.address,
    );
  }

  return <VaultDetails address={params.address} rewardVault={rewardVault} />;
}

export function generateStaticParams() {
  return [
    {
      address: "0x",
    },
  ];
}
