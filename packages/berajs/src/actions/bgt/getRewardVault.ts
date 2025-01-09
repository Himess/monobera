import { balancerApiChainName } from "@bera/config";
import { bexApiGraphqlClient } from "@bera/graphql";
import {
  ApiVaultFragment,
  GetRewardVault,
  GetRewardVaultQuery,
  GetRewardVaultQueryVariables,
  GqlChain,
} from "@bera/graphql/pol/api";

/**
 *
 * @param address - The address of the vault
 * @throws {Error} If the vault is not found
 * @returns
 */
export const getRewardVault = async (
  address: string,
): Promise<ApiVaultFragment> => {
  const { data } = await bexApiGraphqlClient.query<
    GetRewardVaultQuery,
    GetRewardVaultQueryVariables
  >({
    query: GetRewardVault,
    variables: {
      vaultId: address,
      chain: balancerApiChainName as GqlChain,
    },
  });

  if (!data?.rewardVault) {
    throw new Error("Reward vault not found");
  }

  return data.rewardVault;
};
