// import { type Token } from "@bera/berajs";
import { beraTokenAddress, cloudinaryUrl } from "@bera/config";

export const wBeraToken: any = {
  address: beraTokenAddress,
  decimals: 18,
  name: "WBera",
  symbol: "WBERA",
  logoURI: `${cloudinaryUrl}/src/assets/wbera.png`,
};
