import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, ICPSwapPool } from "@icptokens/dex-integration";
import { PoolInfo, Transaction } from "@icptokens/dex-integration/dist/types/ICPSwap.js";

export const TokenPools = {
  ICP_XP: "j5fx-nqaaa-aaaag-qc74a-cai"
};

// get ICPSWAP_BASE_INDEX_CANISTER from dex-integration 
import { ICPSWAP_BASE_INDEX_CANISTER } from "@icptokens/dex-integration/dist/config.js";



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
}

// Initialize ICPSwap client
const initICPSwap = (): ICPSwapMethods => {
  const agent = new HttpAgent({ host: IC_HOST });
  return new ICPSwap({ agent }) as unknown as ICPSwapMethods;
};

/**
 * ICPSwap Transaction Collector
 * Utility class to collect transactions from ICPSwap pools
 */
class TransactionCollector {
  private icpSwap: ICPSwapMethods;
  private baseStorageCanisters: string[] = [];


  constructor() {
    this.icpSwap = initICPSwap();
  }

  /**
  * Gets the pool id for a specific token pair
  * the looks for the oldest transaction in the pool, or if transactionId is provided as an argument
  * then look for that transaction in the pool and get the next trasaction.
  * Gather all the newer transactions in a list and return them
  */
  async getTrxUntilId(timestampTrx: number | null = null, start_offset: bigint = 0n): Promise<Transaction[] | null> {
    
    const foundTransactions: Transaction[] = [];
    try {
      const transactions = await this.icpSwap.getStorageCanisterTransactions(start_offset, 1000n);
      if (transactions.length === 0) {
        console.log(`No transactions found `);
        return null;
      }
      if (timestampTrx) {
        const targetTransaction = transactions.find((tx: Transaction) => tx.timestamp === timestampTrx);
        if (targetTransaction) {
          console.log(`Found target transaction ID: ${targetTransaction.id}, Date: ${new Date(Number(targetTransaction.timestamp) * 1000).toISOString()}`);
          // return a section of the transactions. from the target transaction to the end
          const targetIndex = transactions.indexOf(targetTransaction);
          const newerTransactions = transactions.slice(targetIndex + 1);
          console.log(`Found ${newerTransactions.length} newer transactions`);
          return newerTransactions;
        } else {
          foundTransactions.push(...transactions);
          const moreTransactions = await this.getTrxUntilId(timestampTrx, 1000n);
          if (moreTransactions) {
            foundTransactions.push(...moreTransactions);
          }
        }
      }
      // check if foundTransactions lenght is higher than 3000, then stop
      if (foundTransactions.length > 3000) {
        console.log(`Found ${foundTransactions.length} transactions, stopping collection`);
        return foundTransactions;
      }
      return foundTransactions
    } catch (error) {
      console.error(`Error fetching transactions`, error);
      return null;
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
    const targetTransactionId = "qslyi-dyaaa-aaaag-qngza-cai.heq6n-fyaaa-aaaag-qkcpq-cai.10";
    console.log(`Starting transaction collection until ID: ${targetTransactionId}`);
    
    const collector = new TransactionCollector();
    // await collector.initialize();
    
    // const poolId = TokenPools.ICP_XP;
    const targetTimestamp = 1743768765
    const latestTransactions = await collector.getTrxUntilId(targetTimestamp);
    if (latestTransactions) {
      printTransactions(latestTransactions);
    }

  } catch (error) {
    console.error("Error in main execution:", error);
    process.exit(1);
  }
}

main().catch(console.error);
export { TransactionCollector };
