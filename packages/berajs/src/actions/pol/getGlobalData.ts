import { PublicClient } from "viem";
import { BeraConfig } from "~/types";
import { getBGTGlobalInfo, GlobalInfo } from "./getBGTGlobalInfo";
import { getGlobalCuttingBoard } from "./getGlobalCuttingBoard";
import { getBgtTokenTotalSupply } from "./getBgtTokenTotalSupply";
import { getBgtTokenTotalBoosts } from "./getBgtTokenTotalBoosts";
import { ApiRewardAllocationWeightFragment } from "@bera/graphql/pol/api";

export interface GlobalData extends GlobalInfo {
  globalCuttingBoard: ApiRewardAllocationWeightFragment[];
  bgtTotalSupply: string | undefined;
  bgtTotalBoosts: string | undefined;
}
export const getGlobalData = async (
  publicClient: PublicClient,
  config: BeraConfig,
): Promise<GlobalData> => {
  const [globalData, globalCuttingBoard, bgtTotalSupply, bgtTotalBoosts] =
    await Promise.all([
      getBGTGlobalInfo(),
      getGlobalCuttingBoard(300, config),
      getBgtTokenTotalSupply({
        publicClient,
      }),
      getBgtTokenTotalBoosts({
        publicClient,
      }),
    ]);

  return {
    bgtTotalSupply,
    globalCuttingBoard,
    bgtTotalBoosts,
    ...globalData,
  } satisfies GlobalData;
};
