import { Address, keccak256 } from "viem";

import { useOnChainValidator } from "./useOnChainValidator";
import { useSelectedValidator } from "./useSelectedValidator";
import { ApiValidatorFragment } from "@bera/graphql/pol/api";

export const useValidator = ({ pubkey }: { pubkey: Address }) => {
  const {
    data: indexerValidator,
    isLoading: isIndexerValidatorLoading,
    error: indexerValidatorError,
  } = useSelectedValidator(keccak256(pubkey));

  const {
    data: onChainValidator,
    isLoading: isOnChainValidatorLoading,
    error: onChainValidatorError,
  } = useOnChainValidator({ pubkey });

  return {
    data:
      indexerValidator || onChainValidator
        ? ({
            ...indexerValidator,
            ...onChainValidator,
            operator: onChainValidator?.operator ?? indexerValidator?.operator,
            dynamicData: {
              activeBoostAmount:
                onChainValidator?.dynamicData?.activeBoostAmount ??
                indexerValidator?.dynamicData?.activeBoostAmount ??
                "",
              queuedBoostAmount:
                indexerValidator?.dynamicData?.queuedBoostAmount ?? "",
              usersActiveBoostCount:
                indexerValidator?.dynamicData?.usersActiveBoostCount ?? 0,
              usersQueuedBoostCount:
                indexerValidator?.dynamicData?.usersQueuedBoostCount ?? 0,
              apy: indexerValidator?.dynamicData?.apy ?? "",
              bgtCapturePercentage:
                onChainValidator?.dynamicData?.bgtCapturePercentage ??
                indexerValidator?.dynamicData?.bgtCapturePercentage ??
                "",
              allTimeDistributedBGTAmount:
                indexerValidator?.dynamicData?.allTimeDistributedBGTAmount ??
                "0",
              rewardRate:
                onChainValidator?.dynamicData?.rewardRate ??
                indexerValidator?.dynamicData?.rewardRate ??
                "",
              stakedBeraAmount:
                indexerValidator?.dynamicData?.stakedBeraAmount ?? "",
              lastDayDistributedBGTAmount:
                indexerValidator?.dynamicData?.lastDayDistributedBGTAmount ??
                "",
            },
            id: onChainValidator?.id ?? indexerValidator?.id ?? "",
            pubkey: onChainValidator?.pubkey ?? indexerValidator?.pubkey ?? "",
            metadata: onChainValidator?.metadata ?? indexerValidator?.metadata,
            rewardAllocationWeights:
              onChainValidator?.rewardAllocationWeights ??
              indexerValidator?.rewardAllocationWeights ??
              [],
          } satisfies ApiValidatorFragment)
        : null,
    isLoading: isIndexerValidatorLoading || isOnChainValidatorLoading,
    error: indexerValidatorError || onChainValidatorError,
  };
};
