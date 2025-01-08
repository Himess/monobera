import { rewardVaultFactoryAddress } from "@bera/config";
import useSWRImmutable from "swr/immutable";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";

import { rewardVaultFactoryAbi } from "~/abi";
import { ADDRESS_ZERO } from "~/config";

export const useRewardVaultFromToken = ({
  tokenAddress,
}: {
  tokenAddress: Address | undefined;
}) => {
  const client = usePublicClient();
  return useSWRImmutable(
    client && tokenAddress && isAddress(tokenAddress)
      ? ["useRewardVaultFromToken", tokenAddress]
      : null,
    async () => {
      if (!tokenAddress) {
        throw new Error("useRewardVaultFromToken needs a valid token address");
      }

      const res = await client!.readContract({
        address: rewardVaultFactoryAddress,
        abi: rewardVaultFactoryAbi,
        functionName: "getVault",
        args: [tokenAddress],
      });

      return res === ADDRESS_ZERO ? undefined : res;
    },
  );
};
