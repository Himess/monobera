import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { beraChefAddress } from "@bera/config";
import { cn } from "@bera/ui";
import { InputWithLabel } from "@bera/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bera/ui/select";
import { TextArea } from "@bera/ui/text-area";
import { set } from "date-fns";
import matter from "gray-matter";
import { Address } from "viem";

import {
  CustomProposalActionErrors,
  ProposalAction,
  ProposalErrorCodes,
  ProposalTypeEnum,
} from "~/app/governance/types";

const products = ["Product 1", "Product 2"];

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
  setAction: Dispatch<SetStateAction<ProposalAction>>;
  errors: CustomProposalActionErrors;
}) => {
  const [metadata, setMetadata] = useState<{
    name?: string;
    logoURI?: string;
    product?: string;
    url?: string;
    description?: string;
  }>();

  const nameLengthError =
    metadata?.name && metadata?.name?.length > 40
      ? "Name must be less than 40 characters"
      : null;

  // The logoURI is either a https or http or ipfs cid. It is checked with a regex
  const logoURIError =
    metadata?.logoURI &&
    !/(http|https|ipfs):\/\/[^ "]+$/.test(metadata?.logoURI)
      ? "Invalid URI"
      : null;

  const descriptionToolLongError = metadata?.description
    ? metadata?.description.length > 1000
      ? `Description must be less than 1000 characters. Current length: ${metadata?.description.length}`
      : null
    : null;

  useEffect(() => {
    if (!metadata?.description) return;
    const string = matter.stringify(metadata.description, metadata);
    setAction((prev) => ({
      ...prev,
      metadata: string,
    }));
  }, [metadata]);

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
      <div className="flex flex-col gap-2">
        <InputWithLabel
          variant="black"
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
        {isWhitelisted && (
          <>
            <InputWithLabel
              variant="black"
              label="Name"
              value={metadata?.name}
              error={nameLengthError}
              maxLength={40}
              onChange={async (e) => {
                setMetadata({
                  ...metadata,
                  name: e.target.value,
                });
              }}
            />
            {metadata?.name}
            <InputWithLabel
              variant="black"
              label="Logo URI"
              value={metadata?.logoURI}
              error={logoURIError}
              onChange={async (e) => {
                setMetadata({
                  ...metadata,
                  logoURI: e.target.value,
                });
              }}
            />
            <InputWithLabel
              variant="black"
              label="Product"
              value={metadata?.product}
              error={
                errors?.vault === ProposalErrorCodes.REQUIRED
                  ? "A Vault Must Be Chosen"
                  : errors?.vault === ProposalErrorCodes.INVALID_ADDRESS
                    ? "Invalid Vault address."
                    : errors?.vault
              }
              onChange={async (e) => {
                setMetadata({
                  ...metadata,
                  product: e.target.value,
                });
              }}
            />
            <Select
              onValueChange={(value) =>
                setMetadata({ ...metadata, product: value })
              }
            >
              <SelectTrigger>
                <SelectValue>{metadata?.product}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem value={product}>{product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputWithLabel
              variant="black"
              label="URL"
              value={metadata?.url}
              error={
                errors?.vault === ProposalErrorCodes.REQUIRED
                  ? "A Vault Must Be Chosen"
                  : errors?.vault === ProposalErrorCodes.INVALID_ADDRESS
                    ? "Invalid Vault address."
                    : errors?.vault
              }
              onChange={async (e) => {
                setMetadata({
                  ...metadata,
                  url: e.target.value,
                });
              }}
            />
            <TextArea
              id="proposal-message"
              label="Description"
              // error={
              //   errors.description === ProposalErrorCodes.REQUIRED
              //     ? "Description must be filled"
              //     : errors.description
              // }
              variant="black"
              error={descriptionToolLongError}
              placeholder="Tell us about this vault"
              value={metadata?.description}
              onChange={(e) =>
                setMetadata((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />{" "}
          </>
        )}
      </div>
    </>
  );
};
