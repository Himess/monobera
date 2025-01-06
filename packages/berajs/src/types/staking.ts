import { BoostByValidatorFragment } from "@bera/graphql/pol/subgraph";
import { Address } from "viem";

import type { Token } from "./dex";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";

export interface ValidatorInfo {
  id: Address;
  name: string;
  Description: string;
  website: string;
  logoURI: string;
  twitter?: string;
}

export type Validator = ApiValidatorFragment;

export type UserValidator = Validator & {
  activeBoostAmount: string;
  queuedBoostAmount: string;
  latestBlock: string;
  latestBlockTime: string;
  canActivate?: boolean;
};

interface ProductMetadata {
  name: string;
  logoURI: string;
  url: string;
  description: string;
}

export type Vault = {
  logoURI: string;
  name: string;
  product: string;
  receiptTokenAddress: Address;
  url: string;
  vaultAddress: Address;
  productMetadata?: ProductMetadata;
};

export type RewardVaultIncentive = {
  remainingAmount: number;
  id: Address;
  incentiveRate: number;
  manager: Address;
  token: Token;
  vaultId?: Address;
};

export type Market = {
  name: string;
  logoURI: string;
  url: string;
  description: string;
};

export type UserValidatorBoostQueued = {
  queuedBoostAmount: string;
  user: Address;
};

export type UserValidatorBoostDeposited = {
  activeBoostAmount: string;
  user: Address;
};
