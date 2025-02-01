import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, ICPSwapPool } from "@icptokens/dex-integration";

const agent = new HttpAgent({ host: "https://ic0.app" });
const icpSwap = new ICPSwap({ agent });

/**
 * List of all storage canisters. 
 * 
 * Use these to fetch live & historical transaction data by poll or token.
 * 
 * Index order:
 * - 0 to (length - 1): Oldest to newest storage canisters
 */
const baseStorageCanisters = await icpSwap.getBaseStorageCanisters();

// Set base storage actor before fetching pool transactions.
// Pass address for older transactions.

// Example: Set base storage actor to the oldest storage canister
await icpSwap.setBaseStorageActor(baseStorageCanisters[0]);

const pools = await icpSwap.listPools();
const tokens = await icpSwap.listTokens();

const EXE_ICP_POOL_ID = 'dlfvj-eqaaa-aaaag-qcs3a-cai';

const transactions = await icpSwap.getTransactionsByPool(EXE_ICP_POOL_ID, 0n, 2000n);

console.log(transactions[0]);

const exePool = await icpSwap.getPoolByAddress(EXE_ICP_POOL_ID);

if(exePool) {
  const lpInfo = await exePool.getLPInfo();

  // console.log(lpInfo);
}