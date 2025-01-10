import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { balancerVaultAddress, hubName } from "@bera/config";
import { Address } from "viem";

import { readContract } from "@wagmi/core";
import AddLiquidityContent from "./AddLiquidityContent";
import { bexSubgraphClient } from "@bera/graphql";
import {
  GetSubgraphPool,
  GetSubgraphPoolQuery,
} from "@bera/graphql/dex/subgraph";
import { PoolPageWrapper } from "../details/PoolPageContent";
import { getOnChainPool } from "@bera/berajs/actions";
import { getServerSidePublicClient } from "~/utils/serverSidePublicClient";
import Sentry from "@sentry/nextjs";
export function generateMetadata(): Metadata {
  return {
    title: "Add Liquidity",
    description: `Add liquidity to ${hubName}`,
  };
}

export const revalidate = 600;

export default async function PoolPage({
  params,
}: {
  params: { poolId: string };
}) {
  try {
    const subgraphPromise = bexSubgraphClient.query<GetSubgraphPoolQuery>({
      query: GetSubgraphPool,
      variables: {
        id: params.poolId,
      },
    });

    const pool = await getOnChainPool({
      poolId: params.poolId,
      // @ts-ignore viem types
      publicClient: getServerSidePublicClient(),
    });

    if (!pool) {
      console.error("Pool not found");
      notFound();
    }

    let subgraphPool;
    try {
      subgraphPool = (await subgraphPromise).data.pool;
    } catch (e) {
      console.error("Subgraph pool not found");
    }

    return (
      <PoolPageWrapper pool={subgraphPool}>
        <AddLiquidityContent poolId={params.poolId} />
      </PoolPageWrapper>
    );
  } catch (e) {
    console.log(`Error fetching pools: ${e}`);
    Sentry.captureException(e);
    notFound();
  }
}

export { generateStaticParams } from "../details/page";
