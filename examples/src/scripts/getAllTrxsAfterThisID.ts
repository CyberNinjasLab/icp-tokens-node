import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, ICPSwapPool } from "@icptokens/dex-integration";
import { PoolInfo } from "@icptokens/dex-integration/dist/types/ICPSwap.js";

/**
 * Collects transactions from newest to oldest until finding a specific transaction ID
 * @param stopTransactionId The transaction ID where to stop collecting
 * @param maxTransactions Maximum number of transactions to collect (safety limit)
 * @returns Array of transactions from newest to oldest up to the specified ID
 */
async function getTransactionsUntilId(stopTransactionId: string, maxTransactions: number = 1000): Promise<any[]> {
  try {
    // const agent = new HttpAgent({ host: "https://ic0.app" });
    const agent = await HttpAgent.create({ host: "https://ic0.app" });
    await agent.fetchRootKey().catch(console.error);
    
    const icpSwap = new ICPSwap({ agent });
    const baseStorageCanisters = await icpSwap.getBaseStorageCanisters();
    console.log(`Found ${baseStorageCanisters.length} storage canisters`);
    // Use the latest storage canister for most recent transactions
    const latestStorageCanister = baseStorageCanisters[0];
    console.log(`Using storage canister: ${latestStorageCanister}`);
    
    await icpSwap.setBaseStorageActor(latestStorageCanister);
    
    console.log("Getting pools...");
    const pools = await icpSwap.listPools();
    console.log(`Found ${pools.length} pools`);
    
    if (pools.length === 0) {
      console.log("No pools found");
      return [];
    }
    
    // Find a pool with transactions first
    let activePool: ICPSwapPool | null = null;
    let activePoolId: string = "";
    let poolInfo: PoolInfo | null = null;
    
    // Find a pool with transactions to use for collecting
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const currentPoolInfo: PoolInfo = pool.getPoolInfo();
      const poolId: string = currentPoolInfo.pool;
      
      if (!poolId) {
        console.log(`Pool at index ${i} has undefined poolId, skipping...`);
        continue;
      }
      console.log(`[${i+1}/${pools.length}] Checking pool: ${currentPoolInfo.name} (${poolId})`);
      
      try {
        // check if this pool has any transactions
        const txs = await icpSwap.getTransactionsByPool(poolId, 0n, 1000n);
        if (txs.length > 0) {
          activePool = pool;
          activePoolId = poolId;
          poolInfo = currentPoolInfo;
          console.log(`Found active pool with transactions: ${currentPoolInfo.name} (${poolId})`);
          // TODO: change this not to break on the first pool it find trxs in.
          break;
        } else {
          console.log(`No transactions found in this pool, trying next...`);
        }
      } catch (error) {
        console.error(`Error fetching transactions for pool ${currentPoolInfo.name} (${poolId}):`, error);
        console.log('Trying next pool...');
      }
    }
    
    if (!activePool || !activePoolId) {
      console.log("Could not find any pool with transactions");
      return [];
    }
    
    console.log(`Collecting transactions from pool: ${poolInfo?.name} (${activePoolId})`);
    
    // Now collect transactions until reaching the specific ID
    const collectedTransactions: any[] = [];
    let batchSize = 1000n; // Fetch in batches
    let offset = 0n;
    let foundStopTransaction = false;
    
    while (!foundStopTransaction && collectedTransactions.length < maxTransactions) {
      console.log(`Fetching batch of transactions (offset: ${offset}, limit: ${batchSize})...`);
      
      const txBatch = await icpSwap.getTransactionsByPool(activePoolId, offset, batchSize);
      if (txBatch.length === 0) {
        console.log("No more transactions to fetch");
        break;
      }
      console.log(`Fetched ${txBatch.length} transactions`);
      
      // Check each transaction in this batch
      for (const tx of txBatch) {
        if (tx.id === stopTransactionId) {
          console.log(`Found stop transaction with ID: ${stopTransactionId}`);
          collectedTransactions.push(tx); // Include the stop transaction
          foundStopTransaction = true;
          break;
        }
        collectedTransactions.push(tx);
      }
      
      // Move to the next batch
      offset += batchSize;
      
      // Safety check to prevent infinite loops
      if (txBatch.length < batchSize) {
        console.log("Reached end of available transactions");
        break;
      }
    }
    
    console.log(`Collected ${collectedTransactions.length} transactions in total`);
    return collectedTransactions;
  } catch (error) {
    console.error("Error collecting transactions:", error);
    throw error;
  }
}

async function main() {
  try {
    // Collect transactions after this TRX ID
    const oldTxId = "qslyi-dyaaa-aaaag-qngza-cai.lqt4r-dqaaa-aaaag-qdjpq-cai.5";
    
    console.log(`\nNow collecting transactions until ID: ${oldTxId}`);
    const transactions = await getTransactionsUntilId(oldTxId, 100);
    
    console.log(`\nCollected ${transactions.length} transactions`);
    // for each transaction, print the ID and type
    transactions.forEach((trx, index) => {
      console.log(`Transaction ${index + 1}: Date: ${new Date(Number(trx.ts) * 1000)}, Type: ${trx.type}`);
    });
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main().catch(console.error);
