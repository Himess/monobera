import { governanceSubgraphUrl } from "@bera/config";
import { Icons } from "@bera/ui/icons";

export type PROPOSAL_GENRE = "berahub" | "honey" | "bend" | "berps" | "general";

export type GovernanceTopic = {
  id: PROPOSAL_GENRE;
  color: string;
  icon: React.ReactNode;
  iconBackground?: string;
  name: string;
  slug: string;
  forumLink: string;
  description?: string;
};

export const NativeDapps: GovernanceTopic[] = [
  {
    id: "berahub",
    color: "#E6B434",
    icon: <Icons.hubFav className="h-16 w-16" />,
    name: "BeraHub",
    slug: "berahub",
    description: "Swaps, Pools, Reward Vaults & Validators",
    forumLink: "https://berahub-berachain.discourse.group/",
  },
  {
    id: "honey",
    color: "#EC8A19",
    icon: <Icons.honeyFav className="h-16 w-16" />,
    name: "Honey",
    description: "Minting & Redeeming HONEY.",
    forumLink: "https://honey-berachain.discourse.group/",
    slug: "honey",
  },
  {
    id: "berps",
    color: "#41D6E0",
    icon: <Icons.berpsFav className="h-16 w-16" />,
    name: "BERPS",
    slug: "berps",
    forumLink: "#",
  },
] as const;

export const Others: GovernanceTopic[] = [
  {
    id: "general",
    color: "#AFABAB",
    iconBackground: "#2F2F2F",
    icon: <Icons.ecoFav className="h-16 w-16" />,
    name: "General",
    description: "General Discussion",
    slug: "general",
    forumLink: "https://berachain.discourse.group/",
  },
];

export const getDappByGenre = (genre: PROPOSAL_GENRE) => {
  return (
    NativeDapps.find((dapp) => dapp.id === genre) ||
    Others.find((dapp) => dapp.id === genre)
  );
};

export const isValidGenre = (genre: any): genre is PROPOSAL_GENRE => {
  return (
    NativeDapps.some((dapp) => dapp.id === genre) ||
    Others.some((dapp) => dapp.id === genre)
  );
};
