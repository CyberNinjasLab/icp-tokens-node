import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, ICPSwapPool } from "@icptokens/dex-integration";
import { PoolInfo } from "@icptokens/dex-integration/dist/types/ICPSwap.js";

/**
 * ICPSwap Transaction Collector
 * Utility class to collect transactions from ICPSwap pools
 */
class TransactionCollector {
  private agent: HttpAgent;
  private icpSwap: ICPSwap;
  private pools: ICPSwapPool[] = [];
  private baseStorageCanisters: string[] = [];

  /**
   * Initialize the collector with IC connection
   */
  async initialize(): Promise<void> {
    try {
      this.agent = await HttpAgent.create({ host: "https://ic0.app" });
      await this.agent.fetchRootKey().catch(console.error);
      this.icpSwap = new ICPSwap({ agent: this.agent });
      
      await this.setupStorageCanisters();
      await this.loadPools();
    } catch (error) {
      console.error("Failed to initialize transaction collector:", error);
      throw new Error("Initialization failed");
    }
  }

  /**
   * Set up storage canisters for transaction fetching
   */
  private async setupStorageCanisters(): Promise<void> {
    this.baseStorageCanisters = await this.icpSwap.getBaseStorageCanisters();
    console.log(`Found ${this.baseStorageCanisters.length} storage canisters`);
    
    const latestStorageCanister = this.baseStorageCanisters[0];
    console.log(`Using storage canister: ${latestStorageCanister}`);
    
    await this.icpSwap.setBaseStorageActor(latestStorageCanister);
  }

  /**
   * Load all pools from ICPSwap
   */
  private async loadPools(): Promise<void> {
    console.log("Getting pools...");
    this.pools = await this.icpSwap.listPools();
    console.log(`Found ${this.pools.length} pools`);
  }

  /**
   * Find a pool that contains transactions
   * @returns Pool information and ID for an active pool with transactions
   */
  private async findActivePool(): Promise<{ pool: ICPSwapPool; poolId: string; poolInfo: PoolInfo } | null> {
    if (this.pools.length === 0) {
      console.log("No pools available");
      return null;
    }

    for (let i = 0; i < this.pools.length; i++) {
      const pool = this.pools[i];
      const poolInfo: PoolInfo = pool.getPoolInfo();
      const poolId: string = poolInfo.pool;
      
      if (!poolId) {
        console.log(`Pool at index ${i} has undefined poolId, skipping...`);
        continue;
      }
      
      console.log(`[${i+1}/${this.pools.length}] Checking pool: ${poolInfo.name} (${poolId})`);
      
      try {
        const txs = await this.icpSwap.getTransactionsByPool(poolId, 0n, 10n);
        if (txs.length > 0) {
          console.log(`Found active pool with transactions: ${poolInfo.name} (${poolId})`);
          return { pool, poolId, poolInfo };
        } else {
          console.log(`No transactions found in this pool, trying next...`);
        }
      } catch (error) {
        console.error(`Error fetching transactions for pool ${poolInfo.name} (${poolId}):`, error);
        console.log('Trying next pool...');
      }
    }
    
    return null;
  }

    /**
   * Get all transactions until a specific transaction ID is found
   * Hint: Traverses pools until id is found or limit is reached
   * @param stopTransactionId The transaction ID where to stop collecting
   * @param maxTransactions Maximum number of transactions to collect (safety limit)
   * @returns Array of transactions from newest to oldest up to the specified ID
   */
  async findTransactionInPools(
    stopTransactionId: string, 
    maxTransactions: number = 1000
  ): Promise<any[]> {
    const collectedTransactions: any[] = [];
    
    for (const pool of this.pools) {
      const poolInfo: PoolInfo = pool.getPoolInfo();
      const poolId: string = poolInfo.pool;
      
      console.log(`Checking transactions in pool: ${poolInfo.name} (${poolId})`);
      
      const transactions = await this.fetchTransactionsUntilId(
        poolId, 
        stopTransactionId, 
        maxTransactions - collectedTransactions.length
      );

      if (transactions.length === 0) {
        console.log(`No transactions found in pool: ${poolInfo.name} (${poolId})`);
        continue;
      }
      collectedTransactions.push(...transactions);
      if (collectedTransactions.some(tx => tx.id === stopTransactionId)) {
        console.log(`Found target transaction in pool: ${poolInfo.name} (${poolId})`);
        break;
      }
      if (collectedTransactions.length >= maxTransactions) {
        console.log(`Reached maximum transaction limit of ${maxTransactions}`);
        break;
      }
      
    }
    
    return collectedTransactions;
  }

  /**
   * Fetch transactions in batches from a specific pool until a target transaction ID is found
   * 
   * @param poolId The ID of the pool to fetch transactions from
   * @param stopTransactionId The transaction ID where to stop collection
   * @param maxTransactions Maximum number of transactions to collect (safety limit)
   * @returns Array of collected transactions
   */
  private async fetchTransactionsUntilId(
    poolId: string, 
    stopTransactionId: string, 
    maxTransactions: number
  ): Promise<any[]> {
    const collectedTransactions: any[] = [];
    let batchSize = 1000n; // Fetch in batches
    let offset = 0n;
    let foundStopTransaction = false;
    
    while (!foundStopTransaction && collectedTransactions.length < maxTransactions) {
      console.log(`Fetching batch of transactions (offset: ${offset}, limit: ${batchSize})...`);
      
      const txBatch = await this.icpSwap.getTransactionsByPool(poolId, offset, batchSize);
      if (txBatch.length === 0) {
        console.log("No more transactions to fetch");
        break;
      }
      
      console.log(`Fetched ${txBatch.length} transactions`);
      
      // Check each transaction in this batch
      for (const tx of txBatch) {
        // Add transaction to collection
        collectedTransactions.push(tx);
        
        // Check if this is the stop transaction
        if (tx.id === stopTransactionId || collectedTransactions.length >= maxTransactions) {
          console.log(`Found stop transaction with ID: ${stopTransactionId}`);
          foundStopTransaction = true;
          return collectedTransactions;
        }
      }
      
      // Move to the next batch
      offset += batchSize;
      
      // Safety check to prevent infinite loops
      if (txBatch.length < batchSize) {
        console.log("Reached end of available transactions");
        break;
      }
    }
    
    return collectedTransactions;
  }

  /**
   * Fetches the latest transaction from the first active pool found
   * @param limit Optional number of recent transactions to check (useful to find a valid transaction)
   * @returns The most recent transaction or null if none found
   */
  async getLatestTransaction(): Promise<any | null> {
    try {
      // Find a pool with transactions
      const activePoolData = await this.findActivePool();
      
      if (!activePoolData) {
        console.log("Could not find any pool with transactions");
        return null;
      }
      
      const { poolId, poolInfo } = activePoolData;
      console.log(`Fetching latest transaction from pool: ${poolInfo.name} (${poolId})`);
      
      // Get just the latest transaction (offset 0, small batch size)
      const transactions = await this.icpSwap.getTransactionsByPool(poolId, 0n, BigInt(1));
      
      if (transactions.length === 0) {
        console.log("No transactions found in the active pool");
        return null;
      }
      
      // Get the first transaction (most recent one)
      const latestTransaction = transactions[0];
      console.log(`Found latest transaction with \n ID: ${latestTransaction.id}, \n CreatedAt: ${new Date(Number(latestTransaction.ts) * 1000)}`);
      
      return latestTransaction;
    } catch (error) {
      console.error("Error fetching latest transaction:", error);
      throw error;
    }
  }
}


/**
 * Print transaction information in a formatted way
 * @param transactions List of transactions to print
 */
function printTransactions(transactions: any[]): void {
  console.log(`\nCollected ${transactions.length} transactions`);
  
  if (transactions.length === 0) {
    console.log("No transactions found");
    return;
  }
  
  transactions.forEach((trx, index) => {
    const date = new Date(Number(trx.ts) * 1000);
    console.log(`Transaction ${index + 1}: ID: ${trx.id}, Date: ${date.toISOString()}, Type: ${trx.type}`);
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Transaction ID to search for
    // const targetTransactionId = "qslyi-dyaaa-aaaag-qngza-cai.lqt4r-dqaaa-aaaag-qdjpq-cai.5";
    // const targetTransactionId = "qslyi-dyaaa-aaaag-qngza-cai.heq6n-fyaaa-aaaag-qkcpq-cai.247";
    const targetTransactionId = "qslyi-dyaaa-aaaag-qngza-cai.heq6n-fyaaa-aaaag-qkcpq-cai.10";
    const maxTransactionsToCollect = 100;
    
    console.log(`Starting transaction collection until ID: ${targetTransactionId}`);
    
    // Initialize the collector
    const collector = new TransactionCollector();
    await collector.initialize();
    
    // Collect transactions
    const transactions = await collector.findTransactionInPools(targetTransactionId, maxTransactionsToCollect);
    printTransactions(transactions);
    
    // // Get the latest transaction
    // const latestTransaction = await collector.getLatestTransaction();
    // if (latestTransaction) {
    //   console.log(`Latest transaction ID: ${latestTransaction.id}, Date: ${new Date(Number(latestTransaction.ts) * 1000).toISOString()}`);
    // }

  } catch (error) {
    console.error("Error in main execution:", error);
    process.exit(1);
  }
}

// Execute the script
main().catch(console.error);