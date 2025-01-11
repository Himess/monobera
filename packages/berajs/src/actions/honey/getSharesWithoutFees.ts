import { honeyFactoryAddress } from "@bera/config";
import { Address, PublicClient, parseEther } from "viem";

import { collateralVaultAbi, honeyFactoryAbi } from "~/abi";
import { BeraConfig } from "~/types";

/**
 * Arguments for the getSharesWithoutFees function.
 * The amount is optional because it's used to simulate a mint transaction to change
 * the weights of the assets.
 * This is needed for the global cap limit calculation.
 */
interface getSharesWithoutFeesArgs {
  client: PublicClient;
  config: BeraConfig;
  asset: Address;
  amount?: string;
}

/**
 * Get the balance that has been deposited in the asset vault without fees.
 *
 * @param {Object} args - The arguments object.
 * @param {PublicClient} args.client - The client used to interact with the blockchain.
 * @param {BeraConfig} args.config - The configuration object containing contract addresses.
 * @param {Address} args.asset - The address of the asset to get the shares without fees for.
 * @param {string} args.amount - The amount that is being deposited in the asset vault. Used to simulate a mint transaction.
 *
 * @returns {Promise<bigint | undefined>} The shares without fees for the given asset.
 */
export const getSharesWithoutFees = async ({
  client,
  config,
  asset,
  amount,
}: getSharesWithoutFeesArgs): Promise<bigint | undefined> => {
  try {
    if (!config.contracts?.honeyFactoryAddress)
      throw new Error("missing contract address honeyFactoryAddress");

    const vault = await client.readContract({
      address: config.contracts.honeyFactoryAddress,
      abi: honeyFactoryAbi,
      functionName: "vaults",
      args: [asset],
    });

    const balance = await client.readContract({
      address: vault,
      abi: collateralVaultAbi,
      functionName: "balanceOf",
      args: [honeyFactoryAddress],
    });

    const fees = await client.readContract({
      address: config.contracts.honeyFactoryAddress,
      abi: honeyFactoryAbi,
      functionName: "collectedFees",
      args: [config.contracts.honeyFactoryAddress, asset],
    });

    return balance + parseEther(amount ?? "0") - fees;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
