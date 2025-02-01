import { HttpAgent } from "@dfinity/agent";
import { KongSwap } from "@icptokens/dex-integration";

const agent = new HttpAgent({ host: "https://ic0.app" });
const kongSwap = new KongSwap({ agent });

const kongSwapTransactions = await kongSwap.getAllTransactions();

const kongSwapPools = await kongSwap.listPools();

console.log(kongSwapTransactions[0]);

// console.log(kongSwapTransactions);