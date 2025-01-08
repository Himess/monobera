import useSWR from "swr";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

import { getRewardVaultStakingToken } from "~/actions";

export interface RewardVault {
  stakeToken: Address;
  address: Address;
}
export const useVaultAddress = (vaultAddress: Address) => {
  const publicClient = usePublicClient();
  const QUERY_KEY =
    vaultAddress && publicClient ? ["useVaultAddress", vaultAddress] : null;

  return useSWR<RewardVault>(QUERY_KEY, async () => {
    const [stakeToken] = await Promise.all([
      getRewardVaultStakingToken({
        address: vaultAddress,
        publicClient: publicClient!,
      }),
    ]);
    return { stakeToken, address: vaultAddress };
  });
};
