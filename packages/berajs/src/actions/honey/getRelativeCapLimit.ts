import { Address, PublicClient, parseEther } from "viem";

import { CAP_LIMIT_BUFFER } from "~/utils/constants";
import { honeyFactoryAbi } from "~/abi";
import { BeraConfig } from "~/types";
import { getSharesWithoutFees } from "./getSharesWithoutFees";

interface getRelativeCapLimitArgs {
  client: PublicClient;
  config: BeraConfig;
  asset: Address;
  amount: string;
  isMint: boolean;
}

/**
 * Get the relative cap limit for a given asset.
 *
 * @param {Object} args - The arguments object.
 * @param {PublicClient} args.client - The client used to interact with the blockchain.
 * @param {BeraConfig} args.config - The configuration object containing contract addresses.
 * @param {Address} args.asset - The address of the asset to get the relative cap limit for.
 * @param {string} args.amount - The amount of the asset to get the relative cap limit for.
 * @param {boolean} args.isMint - Whether the transaction is a mint or a redeem.
 *
 * @returns {Promise<boolean | undefined>} If the asset is relatively capped.
 */
export const getRelativeCapLimit = async ({
  client,
  config,
  asset,
  amount,
  isMint,
}: getRelativeCapLimitArgs): Promise<boolean | undefined> => {
  try {
    if (!config.contracts?.honeyFactoryAddress)
      throw new Error("missing contract address honeyFactoryAddress");

    const assetRelativeCap = await client.readContract({
      address: config.contracts.honeyFactoryAddress,
      abi: honeyFactoryAbi,
      functionName: "relativeCap",
      args: [asset],
    });

    const referenceCollateral = await client.readContract({
      address: config.contracts.honeyFactoryAddress,
      abi: honeyFactoryAbi,
      functionName: "referenceCollateral",
    });

    if (asset === referenceCollateral) {
      return false;
    }

    const assetBalance = await getSharesWithoutFees({
      client,
      config,
      asset,
      amount: isMint ? amount : undefined,
    });
    const referenceCollateralBalance = await getSharesWithoutFees({
      client,
      config,
      asset: referenceCollateral,
      amount: isMint ? undefined : amount,
    });

    if (referenceCollateralBalance === 0n) {
      // If the balance of the asset is 0, it means that is capped`
      // because the refence asset has also 0 balance.
      return assetBalance === 0n ? false : true;
    }

    const weight =
      parseEther((assetBalance ?? 0n).toString()) /
      (referenceCollateralBalance ?? 0n);
    if (weight >= assetRelativeCap - CAP_LIMIT_BUFFER) {
      return true;
    }
    return false;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
