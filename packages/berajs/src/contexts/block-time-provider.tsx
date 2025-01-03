import { createContext, useContext, useEffect, useState } from "react";
import {
  blocksClient,
  GetBlocksTimeStamp,
  GetBlocksTimeStampQueryVariables,
  GetBlocksTimeStampQuery,
} from "@bera/graphql";
import { FALLBACK_BLOCK_TIME } from "@bera/config";
import useSWRImmutable from "swr/immutable";

/**
 * Average berachain block time in seconds
 */
export const useBlockTime = (): number => {
  return useContext(BlockTimeContext);
};

export const BlockTimeContext = createContext<number>(FALLBACK_BLOCK_TIME);

export const BlockTimeProvider = ({
  defaultBlockTime = FALLBACK_BLOCK_TIME,
  children,
}: { children: React.ReactNode; defaultBlockTime?: number }) => {
  const SKIP = 40_000;

  const [blockTime, setBlockTime] = useState<number>(defaultBlockTime);

  // This could be cached server side
  const { data } = useSWRImmutable(["useGetBlocksTimeStamp"], async () => {
    const res = await blocksClient.query<
      GetBlocksTimeStampQuery,
      GetBlocksTimeStampQueryVariables
    >({
      query: GetBlocksTimeStamp,
      variables: {
        skip: SKIP,
      },
    });

    return res.data;
  });

  useEffect(() => {
    if (data) {
      setBlockTime(
        (data?.newest[0]?.timestamp - data?.oldest[0]?.timestamp) /
          (data?.newest[0]?.number - data?.oldest[0]?.number),
      );
    } else {
      setBlockTime(defaultBlockTime);
    }
  }, [data]);

  return (
    <BlockTimeContext.Provider value={blockTime}>
      {children}
    </BlockTimeContext.Provider>
  );
};
