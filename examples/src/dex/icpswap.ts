import { HttpAgent } from "@dfinity/agent";
import { ICPSwap } from "@icptokens/dex-integration";

const agent = new HttpAgent({ host: "https://ic0.app" });
const icpSwap = new ICPSwap({ agent });

console.log(await icpSwap.listTokens());
console.log(await icpSwap.listPools());