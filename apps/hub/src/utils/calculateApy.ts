import {
  GqlPoolMinimal,
  GqlRewardVault,
  MinimalPoolInListFragment,
} from "@bera/graphql/dex/api";
import { VaultMinimal } from "@bera/graphql/pol/subgraph";
import BigNumber from "bignumber.js";

export const calculateApy = (wtv: string, bgtInflation: number): number => {
  if (wtv === "0" || bgtInflation === 0) return 0;
  const biWtv = new BigNumber(wtv);
  const biBgtInflation = new BigNumber(bgtInflation);
  return biWtv.times(biBgtInflation).toNumber();
};

export const calcEffectiveVaultApy = (vault: GqlRewardVault) => {
  const vaultApy = Number(vault.dynamicData?.apy ?? 0);
  if (vaultApy < 0) {
    // If a vault APY is -1 it's null.
    return 0;
  }
  // vault APYs are stored as percentages unlike pool APRs
  return vaultApy;
};

export const calcPoolEffectiveApy = (
  pool: GqlPoolMinimal | MinimalPoolInListFragment,
) => {
  if (!pool || !pool.rewardVault) {
    return {
      effectiveApy: 0,
      poolApr: 0,
      vaultApy: 0,
    };
  }
  const poolAPR = Number(pool.dynamicData?.aprItems?.at(0)?.apr ?? 0);

  // NOTE: typically you would never sum APY and APR directly, but @don have given go ahead to do so in this
  // case as the APY is not a 'real' APY.
  const vaultAPY = calcEffectiveVaultApy(pool.rewardVault as GqlRewardVault);

  return {
    effectiveApy: vaultAPY + poolAPR,
    poolApr: poolAPR,
    vaultApy: vaultAPY,
  };
};
