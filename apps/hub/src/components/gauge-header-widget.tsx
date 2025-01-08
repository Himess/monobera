import { truncateHash, useRewardVaults, useTokens } from "@bera/berajs";
import { ApiVaultFragment } from "@bera/graphql/pol/api";
import {
  GaugeIcon,
  MarketIcon,
  TokenIconList,
  getRewardsVaultUrl,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import Link from "next/link";
import { Address } from "viem";

export const GaugeHeaderWidget = ({
  className,
  gauge,
  isLoading,
}: {
  className?: string;
  gauge: ApiVaultFragment | undefined;
  isLoading?: boolean;
}) => {
  const { data } = useTokens();
  const tokenList = data?.tokenList ?? [];
  let list: any = [];
  if (tokenList[0] && tokenList[1]) {
    list = [tokenList[0], tokenList[1]];
  }

  return (
    <>
      {isLoading || !gauge ? (
        <div>Loading</div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-2 whitespace-nowrap text-left",
            className,
          )}
        >
          <div className="text-md flex items-center gap-1 font-medium leading-6">
            <GaugeIcon
              address={gauge.vaultAddress as Address}
              src={gauge.metadata?.logoURI}
            />
            <Link href={getRewardsVaultUrl(gauge.address)}>
              {gauge.metadata?.name ?? truncateHash(gauge.id ?? gauge.address)}
            </Link>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium leading-5">
            <MarketIcon
              market={gauge.metadata?.productName ?? "OTHER"}
              size="md"
            />
            {gauge.metadata?.productName ?? "OTHER"}
          </div>
        </div>
      )}
    </>
  );
};
