import { HttpAgent } from "@dfinity/agent";
import { Sonic } from "@icptokens/dex-integration";

const agent = new HttpAgent({ host: "https://ic0.app" });
const sonic = new Sonic({ agent });

// Fetch tokens
const sonicTokens = await Sonic.fetchTokens();
console.log(sonicTokens);

// Fetch transactions
// const txs = await sonic.getAllTransactions(1);
