import { honeyFactoryAddress } from "@bera/config";
import { Address, PublicClient } from "viem";

import { collateralVaultAbi, honeyFactoryAbi } from "~/abi";
import { BeraConfig } from "~/types";

interface getSharesWithoutFeesArgs {
  client: PublicClient;
  config: BeraConfig;
  asset: Address;
}

export const getSharesWithoutFees = async ({
  client,
  config,
  asset,
}: getSharesWithoutFeesArgs) => {
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

    console.log("vault", vault);
    console.log("balance", balance);
    console.log("fees", fees);

    return fees;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
