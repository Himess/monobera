import { parseEther } from "viem";

// the buffer of the cap limit, if the user gets close to 10% of the cap limit
// they should be warned
export const CAP_LIMIT_BUFFER = parseEther("0.05");
