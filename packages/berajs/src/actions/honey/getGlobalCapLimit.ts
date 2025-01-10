import { Address, PublicClient, parseEther } from "viem";

import { CAP_LIMIT_BUFFER } from "~/utils/constants";
import { honeyFactoryAbi } from "~/abi";
import { BeraConfig } from "~/types";
import { getHoneyCollaterals } from "./getHoneyCollaterals";
import { getSharesWithoutFees } from "./getSharesWithoutFees";
import { isBadCollateralAsset } from "./isBadCollateralAsset";

interface getGlobalCapLimitArgs {
  client: PublicClient;
  config: BeraConfig;
  asset: Address;
  amount: string;
}

/**
 * Get the global cap limit for the Honey protocol.
 *
 * @param {Object} args - The arguments object.
 * @param {PublicClient} args.client - The client used to interact with the blockchain.
 * @param {BeraConfig} args.config - The configuration object containing contract addresses.
 * @param {Address} args.asset - The address of the asset that is being provided for the exchange.
 * @param {string} args.amount - The amount of the asset.
 *
 * @returns {Promise<boolean | undefined>} If the exchange will trigger the global cap limit or get close to it.
 */
export const getGlobalCapLimit = async ({
  client,
  config,
  asset,
  amount,
}: getGlobalCapLimitArgs): Promise<boolean | undefined> => {
  try {
    if (!config.contracts?.honeyFactoryAddress)
      throw new Error("missing contract address honeyFactoryAddress");

    // Fetch the global cap limit as a bigint
    const globalCap = await client.readContract({
      address: config.contracts!.honeyFactoryAddress,
      abi: honeyFactoryAbi,
      functionName: "globalCap",
    });

    const weights = await getWeights({ client, config, asset, amount });

    if (!weights) {
      return undefined;
    }

    for (const weight of weights) {
      if (weight > globalCap - CAP_LIMIT_BUFFER) {
        const totalBalance = await getSharesWithoutFees({
          client,
          config,
          asset,
        });
        return true;
      }
    }

    return false;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

/**
 * Get the weights of the assets in the Honey protocol.
 * taking into account the paused assets but not the blacklisted ones.
 *
 * @param {Object} args - The arguments object.
 * @param {PublicClient} args.client - The client used to interact with the blockchain.
 * @param {BeraConfig} args.config - The configuration object containing contract addresses.
 * @param {Address} args.asset - The address of the asset that is being provided for the exchange.
 * @param {string} args.amount - The amount of the asset.
 *
 * @returns {Promise<Array<bigint> | undefined>} The weights of the assets.
 */
const getWeights = async ({
  client,
  config,
  asset,
  amount,
}: Required<getGlobalCapLimitArgs>): Promise<Array<bigint> | undefined> => {
  const { collaterals: registeredAssets } = await getHoneyCollaterals({
    client,
    config,
  });

  let sum = 0n;
  const weights: Array<bigint> = [];

  for (const singleAsset of registeredAssets) {
    const isBad = await isBadCollateralAsset({
      client,
      config,
      collateral: asset,
    });
    if (isBad?.isBlacklisted || isBad?.isDepegged) {
      continue;
    }

    const share = await getSharesWithoutFees({
      client,
      config,
      asset: singleAsset,
      amount: singleAsset === asset ? amount : "0",
    });
    if (!share) {
      continue;
    }
    sum += share;
    weights.push(share);
  }

  if (sum === 0n) {
    return weights;
  }

  for (const idx in registeredAssets) {
    weights[idx] = parseEther(weights[idx].toString()) / sum;
  }

  return weights;
};
