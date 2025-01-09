import { Address, PublicClient } from "viem";

import { honeyFactoryAbi } from "~/abi";
import { BeraConfig } from "~/types";
import { getHoneyCollaterals } from "./getHoneyCollaterals";
import { getSharesWithoutFees } from "./getSharesWithoutFees";
import { isBadCollateralAsset } from "./isBadCollateralAsset";

interface getGlobalCapLimitArgs {
  client: PublicClient;
  config: BeraConfig;
}

export const getGlobalCapLimit = async ({
  client,
  config,
}: getGlobalCapLimitArgs) => {
  try {
    if (!config.contracts?.honeyFactoryAddress)
      throw new Error("missing contract address honeyFactoryAddress");

    // Fetch the global cap limit as a percentage
    const globalCap = await client.readContract({
      address: config.contracts!.honeyFactoryAddress,
      abi: honeyFactoryAbi,
      functionName: "globalCap",
    });

    const weights = await getWeights({ client, config });

    for (const weight of weights) {
      if (weight > globalCap) {
        return true;
      }
    }

    return false;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

const getWeights = async ({ client, config }: getGlobalCapLimitArgs) => {
  // get weights
  const registeredAssets = await getHoneyCollaterals({ client, config });
  let sum = 0n;
  const weights: Array<bigint> = [];
  for (const asset of registeredAssets) {
    if (await isBadCollateralAsset({ client, config, collateral: asset })) {
      continue;
    }

    const weight = await getSharesWithoutFees({ client, config, asset });
    if (!weight) {
      continue;
    }
    sum += weight;
    weights.push(weight);
  }

  if (sum === 0n) {
    return weights;
  }

  for (const idx in registeredAssets) {
    weights[idx] = (weights[idx] * 1000000000000000000n) / sum;
  }

  return weights;
};
