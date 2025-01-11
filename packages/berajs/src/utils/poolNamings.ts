import { PoolType } from "@berachain-foundation/berancer-sdk";
import { formatUnits } from "viem";

import { Token } from "~/types";

// Utility function to sort tokens by their address without modifying the original array
const sortTokensByAddress = (tokens: Token[]): Token[] => {
  return [...tokens].sort((a, b) =>
    a.address.toLowerCase().localeCompare(b.address.toLowerCase()),
  );
};

export const generatePoolName = (tokens: Token[]): string => {
  if (tokens.length === 0) {
    return "";
  }
  return sortTokensByAddress(tokens)
    .map((token) => token.symbol)
    .join(" | ");
};

export const generatePoolSymbol = (
  tokens: Token[],
  weights: bigint[],
  poolType: PoolType,
): string => {
  const poolTypeString = poolType.toString().toUpperCase();
  if (poolType === PoolType.Weighted) {
    if (weights.length === 0) {
      return "";
    }
    return `${sortTokensByAddress(tokens)
      .map((token, index) => {
        const weight = weights[index];
        const weightPercentage = parseFloat(formatUnits(weight, 18)) * 100;
        return `${weightPercentage.toFixed(0)}${token.symbol}`;
      })
      .join("-")}-${poolTypeString}`;
  }
  return `${sortTokensByAddress(tokens)
    .map((token) => token.symbol)
    .join("-")}-${poolTypeString}`;
};
