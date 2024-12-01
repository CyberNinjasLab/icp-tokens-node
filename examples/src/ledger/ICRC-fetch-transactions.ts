// Import the SnsAggregatorCanister class and required types
import { Ledger } from '@icptokens/token-toolkit';

const canisterId = 'wqihv-qyaaa-aaaak-afjoa-cai';
const ledger = new Ledger(canisterId);

let data = await ledger.iterateTransactions((batch) => {
  console.log(batch[0]);
  return false;
});
