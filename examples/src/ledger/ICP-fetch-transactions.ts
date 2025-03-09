import { IcpLedger } from "@icptokens/token-toolkit";

const ledger = new IcpLedger();

console.log(await ledger.getTotalTransactions());