import Link from "next/link";

import {
  GovernanceTopic,
  NativeDapps,
  Others,
} from "../governance-genre-helper";
import { cn } from "@bera/ui";

const GovernanceSection = ({
  title,
  dapps,
}: {
  title: string;
  dapps: GovernanceTopic[];
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold leading-6 tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4">
        {dapps.map((dapp: GovernanceTopic) => (
          <Link
            className={cn(
              "w-full cursor-pointer overflow-hidden rounded-lg border border-border",
              dapp.forumLink !== "#"
                ? "transition-all hover:scale-105"
                : "opacity-50 pointer-events-none select-none",
            )}
            key={dapp.name}
            href={`/governance/${dapp.slug}`}
          >
            <div
              className="flex justify-center border-b border-border p-1 items-center min-h-24"
              style={{ background: dapp.iconBackground ?? dapp.color }}
            >
              {dapp.icon}
            </div>
            <div className="m-4">
              <h3 className="my-2 text-xl font-semibold">{dapp.name}</h3>
              <h4 className="my-2 text-muted-foreground text-sm">
                {dapp.description}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const HomePage = () => {
  return (
    <div className="flex flex-col gap-12 pt-12 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold leading-6 tracking-wider text-muted-foreground">
          GOVERNANCE
        </h1>
        <h2 className="text-5xl font-bold">
          Berachain <br /> Governance
        </h2>
      </div>

      <GovernanceSection
        title=""
        dapps={[...NativeDapps, ...Others].filter(
          (dapp) => dapp.forumLink !== "#",
        )}
      />
    </div>
  );
};
