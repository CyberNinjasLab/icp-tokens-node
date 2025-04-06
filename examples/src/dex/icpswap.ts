import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, Transaction } from "@icptokens/dex-integration";

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
    // // List all tokens
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

      console.log("** Getting transactions until a specific ID **");
      const trxId = "qopcz-uyaaa-aaaag-qng3a-cai.3124";
      const trxs = await transactionExamples.getTrxsUntilId(trxId);
      if (trxs) {
        console.log("** Number of transactions collected:", trxs.length);
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