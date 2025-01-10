import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { hubName, isIPFS } from "@bera/config";
import Sentry from "@sentry/nextjs";
import WithdrawPageContent from "../../[poolId]/withdraw/WithdrawPageContent";
import { PoolPageWrapper } from "../details/PoolPageContent";
import { bexSubgraphClient } from "@bera/graphql";
import {
  GetSubgraphPool,
  GetSubgraphPoolQuery,
} from "@bera/graphql/dex/subgraph";
import { getOnChainPool } from "@bera/berajs/actions";
import { getServerSidePublicClient } from "~/utils/serverSidePublicClient";

export { generateStaticParams } from "../details/page";

export function generateMetadata(): Metadata {
  return {
    title: "Withdraw Liquidity",
    description: `Withdraw your liquidity from ${hubName}`,
  };
}

export const revalidate = 600;

export default async function Withdraw({
  params,
}: {
  params: { poolId: string };
}) {
  try {
    if (isIPFS) {
      return null;
    }
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
        <WithdrawPageContent poolId={params.poolId!} />
      </PoolPageWrapper>
    );
  } catch (e) {
    console.log(`Error fetching pools: ${e}`);
    Sentry.captureException(e);
    notFound();
  }
}
