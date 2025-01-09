import { defaultBeraNetworkConfig } from "@bera/wagmi/config";
import "server-only";
import { createPublicClient, http } from "viem";

export const getServerSidePublicClient = async () => {
  return createPublicClient({
    // @ts-ignore viem types
    chain: defaultBeraNetworkConfig.chain,
    transport: http(),
  });
};
