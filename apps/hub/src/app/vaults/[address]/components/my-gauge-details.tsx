import { useBeraJs, usePollVaultsInfo, useTokenHoneyPrice } from "@bera/berajs";
import { beraTokenAddress } from "@bera/config";
import { FormattedNumber } from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import { Icons } from "@bera/ui/icons";
import BigNumber from "bignumber.js";

import { ClaimBGTModal } from "../../components/claim-modal";
import { useState } from "react";
import { ApiVaultFragment } from "@bera/graphql/pol/api";
import { Address } from "viem";
import { DepositLP } from "./deposit-lp";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@bera/ui/dialog";
import { WithdrawLP } from "./WithdrawLP";
import Markdown from "react-markdown";

export const MyGaugeDetails = ({
  rewardVault,
}: {
  rewardVault: ApiVaultFragment;
}) => {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const { isReady } = useBeraJs();

  const { data } = usePollVaultsInfo({
    vaultAddress: rewardVault.vaultAddress as Address,
  });

  const { data: price } = useTokenHoneyPrice({
    tokenAddress: beraTokenAddress,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6">
        <DepositLP rewardVault={rewardVault} />
        {rewardVault.metadata?.description && (
          <div className="border border-border flex w-full gap-2 rounded-md p-4 mt-4 text-sm font-medium">
            <div>
              <Icons.tooltip height={16} width={16} />
            </div>
            <div>
              <h3 className="leading-none mb-1">
                How do I get Receipt Tokens?
              </h3>
              <p className="text-muted-foreground leading-normal">
                <Markdown
                  components={{
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        className="underline"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    i: ({ children }) => <i className="italic">{children}</i>,
                    b: ({ children }) => (
                      <b className="font-medium">{children}</b>
                    ),
                  }}
                  allowedElements={["a", "i", "b", "p"]}
                >
                  {rewardVault?.metadata?.description}
                </Markdown>
              </p>
            </div>
          </div>
        )}
      </div>
      {isReady && data ? (
        <div className="lg:col-span-5 flex w-full flex-col gap-4">
          <div className="flex flex-col gap-6 rounded-md border border-border p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold leading-7">
                My Staked Tokens
              </h3>
              <Dialog>
                <DialogTrigger>
                  <Button variant={"outline"} className="py-2 px-4">
                    Withdraw
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogTitle>Unstake Receipt Tokens</DialogTitle>
                  <WithdrawLP rewardVault={rewardVault} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-between font-medium leading-6">
              <div>{rewardVault?.metadata?.name}</div>
              <div className="flex flex-row items-center gap-2">
                <FormattedNumber
                  value={data?.balance ?? 0}
                  showIsSmallerThanMin
                />
                <FormattedNumber
                  value={data?.percentage ?? 0}
                  percent
                  showIsSmallerThanMin
                  className="text-sm text-muted-foreground"
                />
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border p-4">
            <div className="text-xl font-semibold leading-7">Rewards</div>
            <div className="my-6 flex justify-between font-medium leading-6">
              <div className="flex items-center gap-2">
                <Icons.bgt className="h-6 w-6" />
                BGT
              </div>
              <div className="flex flex-row items-center gap-2">
                <FormattedNumber
                  value={data?.rewards ?? 0}
                  showIsSmallerThanMin
                />
                <FormattedNumber
                  value={BigNumber(data?.rewards ?? "0").times(price ?? 0)}
                  symbol="USD"
                  showIsSmallerThanMin
                  prefixText="("
                  suffixText=")"
                  className="text-sm text-muted-foreground"
                />
              </div>
            </div>
            <Button
              disabled={!data.rewards || Number(data.rewards) <= 0}
              onClick={() => setIsClaimModalOpen(true)}
              className="w-full"
            >
              Claim
            </Button>

            <ClaimBGTModal
              isOpen={isClaimModalOpen}
              onOpenChange={setIsClaimModalOpen}
              rewardVault={rewardVault.vaultAddress as Address}
            />
          </div>
        </div>
      ) : (
        <div className="lg:col-span-5 w-full" />
      )}
    </div>
  );
};
