import {
  beraTokenAddress,
  bgtTokenAddress,
  honeyTokenAddress,
} from "@bera/config";
import {
  GetTokenInformation,
  GetTokenInformationQuery,
} from "@bera/graphql/dex/subgraph";
import { bexSubgraphClient } from "@bera/graphql";
import { Address } from "viem";

import { BeraConfig } from "~/types/global";
import { handleNativeBera } from "~/utils";

interface FetchHoneyPriceArgs {
  tokenAddress?: string | undefined;
  config: BeraConfig;
}

/**
 * fetch the current honey price of a given token
 */
export const getSubgraphHoneyPrice = async ({
  tokenAddress,
}: FetchHoneyPriceArgs): Promise<string | undefined> => {
  try {
    if (!tokenAddress) {
      return "0";
    }
    if (tokenAddress.toLowerCase() === honeyTokenAddress.toLowerCase()) {
      return "1";
    }

    const result = await bexSubgraphClient.query<GetTokenInformationQuery>({
      query: GetTokenInformation,
      variables: {
        pricingAsset: honeyTokenAddress.toLowerCase(),
        asset:
          handleNativeBera(tokenAddress as Address).toLowerCase() ===
          bgtTokenAddress.toLowerCase()
            ? beraTokenAddress.toLowerCase()
            : handleNativeBera(tokenAddress as Address).toLowerCase(),
      },
    });

    const price = result.data.tokenPrices?.[0]?.price;

    if (!price) {
      console.warn("no price found for", tokenAddress);
    }

    return price;
  } catch (e: any) {
    console.log(e);
    throw e;
  }
};
