import { Dispatch, SetStateAction } from "react";
import { beraChefAddress } from "@bera/config";
import { cn } from "@bera/ui";
import { InputWithLabel } from "@bera/ui/input";
import { Dropdown } from "@bera/shared-ui";
import { TextArea } from "@bera/ui/text-area";

import { Address } from "viem";

import {
  CustomProposalActionErrors,
  ProposalAction,
  ProposalErrorCodes,
  ProposalTypeEnum,
} from "~/app/governance/types";
import { useGaugesMetadata } from "@bera/berajs";
import { Label } from "@bera/ui/label";

export const UpdateVaultWhitelistStatus = ({
  action: gauge,
  setAction,
  errors,
}: {
  action: ProposalAction & {
    type:
      | ProposalTypeEnum.BLACKLIST_REWARD_VAULT
      | ProposalTypeEnum.WHITELIST_REWARD_VAULT;
  };
  setAction: Dispatch<
    SetStateAction<
      ProposalAction & {
        type:
          | ProposalTypeEnum.BLACKLIST_REWARD_VAULT
          | ProposalTypeEnum.WHITELIST_REWARD_VAULT;
      }
    >
  >;
  errors: CustomProposalActionErrors;
}) => {
  const { data: rewardVaultMetadata } = useGaugesMetadata();

  const protocolValues = ((rewardVaultMetadata &&
    Object.values(
      rewardVaultMetadata as Record<
        `0x${string}`,
        {
          product: string;
        }
      >,
    ).map((v) => v.product)) as string[]) || ["Loading..."];

  const protocolArray = [
    { value: undefined, label: "No protocol" },
    ...new Set(protocolValues).values(),
  ];

  const isWhitelisted = gauge.type === ProposalTypeEnum.WHITELIST_REWARD_VAULT;
  return (
    <>
      <div className="rounded-md border border-border p-3">
        <div className="flex gap-2 text-sm font-semibold">
          <span
            className={cn(
              !isWhitelisted
                ? "text-destructive-foreground"
                : "text-success-foreground",
            )}
          >
            {isWhitelisted
              ? "This vault will be able to receive BGT rewards."
              : "This vault will not be able to receive BGT rewards."}
          </span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Update this reward vault to be {!isWhitelisted ? "in-" : ""}
          eligible to receive emissions.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <InputWithLabel
          id="vault-address"
          variant="black"
          placeholder="0x..."
          label="Reward Vault Address"
          value={gauge?.vault}
          error={
            errors?.vault === ProposalErrorCodes.REQUIRED
              ? "A Vault Must Be Chosen"
              : errors?.vault === ProposalErrorCodes.INVALID_ADDRESS
                ? "Invalid Vault address."
                : errors?.vault
          }
          onChange={async (e) => {
            setAction({
              ...gauge,
              target: beraChefAddress,
              vault: e.target.value as Address,
            });
          }}
        />
        <InputWithLabel
          variant="black"
          id="vault-name"
          label="Name"
          placeholder="Name of the vault"
          value={gauge.metadata?.name}
          error={errors?.metadata?.name}
          maxLength={40}
          onChange={async (e) => {
            setAction((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, name: e.target.value },
            }));
          }}
        />
        <InputWithLabel
          variant="black"
          id="vault-logo-uri"
          label="Logo URI"
          placeholder="https:// or ipfs://"
          value={gauge.metadata?.logoURI}
          error={errors?.metadata?.logoURI}
          onChange={async (e) => {
            setAction((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, logoURI: e.target.value },
            }));
          }}
        />
        <div className="-mt-1">
          <Label>Protocol</Label>
          <Dropdown
            sortby={false}
            className="!w-full !grow bg-black rounded-md mt-1"
            triggerClassName="!w-full grow justify-between bg-black"
            contentClassname="!w-full !grow bg-black"
            selectionList={protocolArray.map((protocol) =>
              typeof protocol === "string"
                ? {
                    value: protocol,
                    label: protocol,
                  }
                : protocol,
            )}
            placeholder="No protocol"
            selected={gauge.metadata?.protocol || ""}
            onSelect={(value) =>
              setAction((prev) => ({
                ...prev,
                metadata: { ...prev.metadata, protocol: value },
              }))
            }
          />
        </div>
        <InputWithLabel
          variant="black"
          id="vault-url"
          label="URL"
          placeholder="https://"
          value={gauge.metadata?.url}
          error={errors?.metadata?.url}
          onChange={async (e) => {
            setAction((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, url: e.target.value },
            }));
          }}
        />
        <TextArea
          id="vault-description"
          label="Description"
          error={errors?.metadata?.description}
          variant="black"
          placeholder="Tell us about this vault"
          value={gauge.metadata?.description}
          onChange={(e) =>
            setAction((prev) => ({
              ...prev,
              metadata: { ...prev.metadata, description: e.target.value },
            }))
          }
        />
      </div>
    </>
  );
};
