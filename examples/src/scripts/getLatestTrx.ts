import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, ICPSwapPool } from "@icptokens/dex-integration";
import { PoolInfo } from "@icptokens/dex-integration/dist/types/ICPSwap.js";

async function getNewestTransaction() {
  try {
    // Create an agent and ICPSwap instance
    const agent = new HttpAgent({ host: "https://ic0.app" });
    // Add this line for local development
    await agent.fetchRootKey().catch(console.error);
    
    const icpSwap = new ICPSwap({ agent });
    
    console.log("^^^^Getting storage canisters...");
    // 1. Get the latest storage canister
    const baseStorageCanisters = await icpSwap.getBaseStorageCanisters();
    console.log(`Found ${baseStorageCanisters.length} storage canisters`);
    
    // The latest storage canister is the last one in the array
    const latestStorageCanister = baseStorageCanisters[0]; //baseStorageCanisters.length - 1
    console.log(`Using storage canister: ${latestStorageCanister}`);
    
    // 2. Set the base storage actor to use the latest storage canister
    await icpSwap.setBaseStorageActor(latestStorageCanister);
    
    console.log("Getting pools...");
    // 3. Get all pools
    const pools = await icpSwap.listPools();
    console.log(`Found ${pools.length} pools`);
    
    if (pools.length === 0) {
      console.log("No pools found");
      return null;
    }
    
    // 4. Get the most recent transaction from each pool
    interface Transaction {
      ts: bigint;
      type: string;
      [key: string]: any;
    }
    
    console.log("Getting transactions from pools...");
    
    // Only use first pool for testing to avoid too many requests
    // 4. Iterate through pools to find one with transactions
    for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        const poolInfo: PoolInfo = pool.getPoolInfo();
        const poolId: string = poolInfo.pool;
        
        if (!poolId) {
          console.log(`Pool at index ${i} has undefined poolId, skipping...`);
          continue;
        }
        
        console.log(`[${i+1}/${pools.length}] Checking pool: ${poolInfo.name} (${poolId})`);
        
        try {
          const txs = await icpSwap.getTransactionsByPool(poolId, 0n, 1000n);
          if (txs.length > 0) {
            console.log(`Found ${txs.length} transaction(s) in pool ${poolInfo.name}`);
            console.log(`Pool details: ${poolInfo.name}, ${poolInfo.token0}/${poolInfo.token1}`);
            return txs[0]; // Return the first transaction, which is the most recent
          } else {
            console.log(`No transactions found in this pool, trying next...`);
          }
        } catch (error) {
          console.error(`Error fetching transactions for pool ${poolInfo.name} (${poolId}):`, error);
          console.log('Trying next pool...');
        }
    }
    
    console.log("No transactions found in any pool");
    return null;
  } catch (error) {
    console.error("Error in getNewestTransaction:", error);
    throw error;
  }
}

// Usage
getNewestTransaction()
  .then(transaction => {
    if (transaction) {
      console.log("Newest transaction:", transaction);
      console.log("Transaction type:", transaction.type);
      console.log("Timestamp:", new Date(Number(transaction.ts) * 1000));
    } else {
      console.log("No transactions found");
    }
  })
  .catch(error => console.error("Error fetching newest transaction:", error));