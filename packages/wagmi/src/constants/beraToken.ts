// import { Token } from "@bera/berajs";
import { cloudinaryUrl, nativeTokenAddress } from "@bera/config";

export const beraToken: any = {
  address: nativeTokenAddress,
  decimals: 18,
  name: "Bera",
  symbol: "BERA",
  logoURI: `${cloudinaryUrl}/src/assets/bera.png`,
};
