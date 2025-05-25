import { HttpAgent } from "@dfinity/agent";
import { DatabaseConfig } from "@icptokens/db-client";
import { ICPSwap, Transaction, DatabaseTransactionProcessor, TransactionSource } from "@icptokens/dex-integration";
import dotenv from 'dotenv';
dotenv.config();

/**
 * ICPSwap Integration Examples
 * This file demonstrates various interactions with the ICPSwap DEX
 */

// Configuration
const IC_HOST = "https://ic0.app";
const EXAMPLE_POOL_IDS = {
  BOB_ICP: 'ybilh-nqaaa-aaaag-qkhzq-cai',
  XP_ICP: 'oj5fx-nqaaa-aaaag-qc74a-cai',
};

// Define interface for ICPSwap methods we need
interface ICPSwapMethods {
  getBaseStorageCanisters(): Promise<string[]>;
  setBaseStorageActor(address?: string): Promise<void>;
  getStorageCanisterTransactions(startOffset: bigint, limit: bigint): Promise<Transaction[]>;
  getTransactionsByPool(poolId: string, startOffset: bigint, limit: bigint): Promise<Transaction[]>;
  listPools(): Promise<any[]>;
  listTokens(): Promise<any[]>;
  getPoolByAddress(address: string): Promise<any>;
  getTrxUntilId(trxId: string, startOffset: bigint, collectedTrxs: Transaction[]): Promise<Transaction[]>;
  getTrxsAfterTrxId(trxId: string, limit: number): Promise<Transaction[]>;
}

// Initialize ICPSwap client
const initICPSwap = (): ICPSwapMethods => {
  const agent = new HttpAgent({ host: IC_HOST });
  return new ICPSwap({ agent }) as unknown as ICPSwapMethods;
};

/**
 * Pool Management Examples
 */
class PoolExamples {
  private icpSwap: ICPSwapMethods;

  constructor() {
    this.icpSwap = initICPSwap();
  }

  // List all available pools
  async listAllPools() {
    try {
      const pools = await this.icpSwap.listPools();
      console.log("Total pools found:", pools.length);
      console.log("Sample pool data:", pools[0]);
      return pools;
    } catch (error) {
      console.error("Error listing pools:", error);
      throw error;
    }
  }

  // Get detailed information about a specific pool
  async getPoolDetails(poolId: string) {
    try {
      const pool = await this.icpSwap.getPoolByAddress(poolId);
      if (!pool) {
        console.log(`Pool ${poolId} not found`);
        return null;
      }

      const lpInfo = await pool.getLPInfo();
      console.log(`Pool ${poolId} details:`, lpInfo);
      return lpInfo;
    } catch (error) {
      console.error(`Error getting pool details for ${poolId}:`, error);
      throw error;
    }
  }
}

/**
 * Token Management Examples
 */
class TokenExamples {
  private icpSwap: ICPSwapMethods;

  constructor() {
    this.icpSwap = initICPSwap();
  }

  // List all available tokens
  async listAllTokens() {
    try {
      const tokens = await this.icpSwap.listTokens();
      console.log("Total tokens found:", tokens.length);
      console.log("Sample token data:", tokens[0]);
      return tokens;
    } catch (error) {
      console.error("Error listing tokens:", error);
      throw error;
    }
  }
}

/**
 * Transaction and Storage Examples
 */
class TransactionExamples {
  private icpSwap: ICPSwapMethods;

  constructor() {
    this.icpSwap = initICPSwap();
  }

  // List all storage canisters
  async listStorageCanisters() {
    try {
      const canisters = await this.icpSwap.getBaseStorageCanisters();
      console.log("Available storage canisters:", canisters);
      return canisters;
    } catch (error) {
      console.error("Error listing storage canisters:", error);
      throw error;
    }
  }

  // Initialize storage canister (required before fetching transactions)
  async initializeStorageCanister(canisterId?: string) {
    try {
      await this.icpSwap.setBaseStorageActor(canisterId);
      console.log("Storage canister initialized", canisterId ? `with ID: ${canisterId}` : "with latest canister");
    } catch (error) {
      console.error("Error initializing storage canister:", error);
      throw error;
    }
  }

  // Get transactions from a storage canister
  async getStorageTransactions(fromIndex = 0n, limit = 2000n): Promise<Transaction[]> {
    try {
      const transactions = await this.icpSwap.getStorageCanisterTransactions(fromIndex, limit);
      console.log(`Retrieved ${transactions.length} transactions`);
      if (transactions.length > 0) {
        console.log("Sample transaction:", transactions[0]);
      }
      return transactions;
    } catch (error) {
      console.error("Error getting storage transactions:", error);
      throw error;
    }
  }

  // Get transactions for a specific pool
  async getPoolTransactions(poolId: string, fromIndex = 0n, limit = 100n): Promise<Transaction[]> {
    try {
      const transactions = await this.icpSwap.getTransactionsByPool(poolId, fromIndex, limit);
      console.log(`Retrieved ${transactions.length} transactions for pool ${poolId}`);
      if (transactions.length > 0) {
        console.log("Sample pool transaction:", transactions[0]);
      }
      return transactions;
    } catch (error) {
      console.error(`Error getting transactions for pool ${poolId}:`, error);
      throw error;
    }
  }


  async getTrxsUntilId(trxId: string, startOffset: bigint = 0n, collectedTrxs: Transaction[] = []): Promise<Transaction[]> {
    return await this.icpSwap.getTrxUntilId(trxId, startOffset, collectedTrxs)
  }
  async getTrxsAfterTrxId(trxId: string, batchSize: number = 10000): Promise<Transaction[]> {
    return await this.icpSwap.getTrxsAfterTrxId(trxId, batchSize)
  }
  
}

// Database configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mydb',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASS || 'password',
  logging: process.env.NODE_ENV !== 'production'
};

// IC configuration
// const IC_HOST = process.env.IC_HOST || "https://ic0.app";

/**
 * ICPSwap Transaction Sync Example
 * 
 * This example demonstrates how to:
 * 1. Connect to the ICP network
 * 2. Initialize the ICPSwap client
 * 3. Connect to the database
 * 4. Fetch transactions from ICPSwap
 * 5. Store them in the database
 * 6. Update the pointer for the last processed transaction
 */
async function runDatabaseSync() {
  console.log("Starting ICPSwap transaction sync example...");
  console.log(`Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log(`IC Host: ${IC_HOST}`);

  try {
    // Initialize ICPSwap client
    const agent = new HttpAgent({ host: IC_HOST });
    const icpSwap = new ICPSwap({ agent });

    // Create database transaction processor
    const processor = new DatabaseTransactionProcessor(
      TransactionSource.ICPSWAP,
      icpSwap as any, // Type assertion needed due to interface incompatibility
      dbConfig
    );

    console.log("Created DatabaseTransactionProcessor");

    // Process different batch sizes and limits
    const syncOptions = [
      { batchSize: 100, maxBatches: 1, label: "Small initial test" },
      { batchSize: 1000, maxBatches: 5, label: "Medium-sized sync" },
    ];

    for (const option of syncOptions) {
      console.log(`\n--- Running sync: ${option.label} ---`);
      console.log(`Batch size: ${option.batchSize}, Max batches: ${option.maxBatches}`);
      
      const result = await processor.syncTransactions({
        batchSize: option.batchSize,
        maxBatches: option.maxBatches,
        autoClose: false // Keep connection open between runs
      });
      
      console.log(`Sync results for ${option.label}:`);
      console.log(`- Total transactions processed: ${result.totalProcessed}`);
      console.log(`- Last transaction ID: ${result.lastTransactionId}`);
      console.log(`- Total duration: ${result.duration / 1000} seconds`);
      
      if (result.totalProcessed > 0) {
        console.log(`- Average time per transaction: ${result.duration / result.totalProcessed} ms`);
      }
    }

    // Finally, close the database connection
    await processor.closeConnection();
    console.log("Database connection closed");
    
  } catch (error) {
    console.error("Error in database sync example:", error);
  }
}

// Function to test the pointer retrieval and update
async function testPointerManagement() {
  console.log("\n--- Testing Pointer Management ---");

  try {
    // Initialize ICPSwap client
    const agent = new HttpAgent({ host: IC_HOST });
    const icpSwap = new ICPSwap({ agent });

    // Create database transaction processor
    const processor = new DatabaseTransactionProcessor(
      TransactionSource.ICPSWAP,
      icpSwap as any,
      dbConfig
    );

    // Initialize storage canister
    const canisterId = await processor.initialize();
    console.log(`Initialized storage canister: ${canisterId}`);

    // Get current pointer
    const currentPointer = await processor.getLastProcessedTransaction(canisterId);
    console.log(`Current pointer: ${currentPointer || 'No pointer found (first run)'}`);

    // If no pointer exists, create a test one
    if (!currentPointer) {
      // Save a sample transaction to create a pointer
      const transactions = await icpSwap.getStorageCanisterTransactions(0n, 1n);
      if (transactions.length > 0) {
        await processor.saveTransactions(transactions, canisterId);
        const newPointer = await processor.getLastProcessedTransaction(canisterId);
        console.log(`Created initial pointer: ${newPointer}`);
      } else {
        console.log("No transactions found to create a pointer");
      }
    }

    // Close the database connection
    await processor.closeConnection();
    console.log("Database connection closed");
    
  } catch (error) {
    console.error("Error in pointer management test:", error);
  }
}

/**
 * Example Usage
 */
async function runExamples() {
  try {
    // Initialize example classes
    const poolExamples = new PoolExamples();
    const tokenExamples = new TokenExamples();
    const transactionExamples = new TransactionExamples();

    console.log("\n1. Pool Examples:");
    // List all pools
    await poolExamples.listAllPools();
    // Get specific pool details
    await poolExamples.getPoolDetails(EXAMPLE_POOL_IDS.BOB_ICP);

    console.log("\n2. Token Examples:");
    // List all tokens
    await tokenExamples.listAllTokens();

    console.log("\n3. Transaction Examples:");
    // List storage canisters
    const canisters = await transactionExamples.listStorageCanisters();
    
    // Initialize with the most recent storage canister
    if (canisters.length > 0) {
      await transactionExamples.initializeStorageCanister(canisters[0]);
      
      // Get transactions from storage
      await transactionExamples.getStorageTransactions();
      
      // Get transactions for a specific pool
      await transactionExamples.getPoolTransactions(EXAMPLE_POOL_IDS.BOB_ICP);



      console.log("** Getting transactions after a specific ID **");
      const lastTrxId = "2uu7v-wqaaa-aaaag-qnhcq-cai.119";
      const collectedTrxs = await transactionExamples.getTrxsAfterTrxId(lastTrxId);
      // print the last transaction
      if (collectedTrxs.length > 0) {
        console.log(`Last transaction in the batch:`, collectedTrxs[collectedTrxs.length - 1]);
        console.log(`Last transaction in the batch:`, collectedTrxs[collectedTrxs.length - 2]);
        console.log(`Last transaction in the batch:`, collectedTrxs[collectedTrxs.length - 3]);
    } else {
        console.log(`No transactions found after ${lastTrxId}`);
    }
      if (collectedTrxs) {
        console.log("** Number of transactions collected:", collectedTrxs.length);
      }
    }

  } catch (error) {
    console.error("Error in examples:", error);
  }
}

// Run examples if this is the main module
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  runExamples().then(() => {
    console.log("Examples completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

// Export classes for individual usage
export {
  PoolExamples,
  TokenExamples,
  TransactionExamples,
};