import { Address, PublicClient } from "viem";

import { honeyFactoryAbi } from "~/abi";
import { BeraConfig } from "~/types";
import { getSharesWithoutFees } from "./getSharesWithoutFees";

interface getRelativeCapLimitArgs {
  client: PublicClient;
  config: BeraConfig;
  asset: Address;
}

export const getRelativeCapLimit = async ({
  client,
  config,
  asset,
}: getRelativeCapLimitArgs) => {
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
      return true;
    }

    const assetBalance = await getSharesWithoutFees({ client, config, asset });
    const referenceCollateralBalance = await getSharesWithoutFees({
      client,
      config,
      asset: referenceCollateral,
    });

    if (referenceCollateralBalance === 0n) {
      // If the balance of the asset is 0, it means that is capped
      // because the refence asset has also 0 balance.
      return assetBalance === 0n ? true : false;
    }

    const weight =
      ((assetBalance ?? 0n) * 1000000000000000000n) /
      (referenceCollateralBalance ?? 0n);
    return weight <= assetRelativeCap;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
