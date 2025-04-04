import { HttpAgent } from "@dfinity/agent";
import { ICPSwap, ICPSwapPool } from "@icptokens/dex-integration";
import { PoolInfo, Transaction } from "@icptokens/dex-integration/dist/types/ICPSwap.js";

export const TokenPools = {
  ICP_XP: "j5fx-nqaaa-aaaag-qc74a-cai"
};

/**
 * ICPSwap Transaction Collector
 * Utility class to collect transactions from ICPSwap pools
 */
class TransactionCollector {
  private agent!: HttpAgent;
  private icpSwap!: ICPSwap;
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
  * Gets the pool id for a specific token pair
  * the looks for the oldest transaction in the pool, or if transactionId is provided as an argument
  * then look for that transaction in the pool and get the next trasaction.
  * Gather all the newer transactions in a list and return them
  */
  async getTrxUntilId(poolId: string, transactionId: string | null = null, start_offset: bigint = 0n): Promise<Transaction[] | null> {
    
    const foundTransactions: Transaction[] = [];
    try {
      const transactions = await this.icpSwap.getTransactionsByPool(poolId, start_offset, 1000n);
      if (transactions.length === 0) {
        console.log(`No transactions found in pool: ${poolId}`);
        return null;
      }
      if (transactionId) {
        const targetTransaction = transactions.find(tx => tx.id === transactionId);
        if (targetTransaction) {
          console.log(`Found target transaction ID: ${targetTransaction.id}, Date: ${new Date(Number(targetTransaction.ts) * 1000).toISOString()}`);
          // return a section of the transactions. from the target transaction to the end
          const targetIndex = transactions.indexOf(targetTransaction);
          const newerTransactions = transactions.slice(targetIndex + 1);
          console.log(`Found ${newerTransactions.length} newer transactions`);
          return newerTransactions;
        } else {
          foundTransactions.push(...transactions);
          const moreTransactions = await this.getTrxUntilId(poolId, transactionId, 1000n);
          if (moreTransactions) {
            foundTransactions.push(...moreTransactions);
          }
        }
      }
      return foundTransactions
    } catch (error) {
      console.error(`Error fetching transactions for pool ${poolId}:`, error);
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
    await collector.initialize();
    
    const poolId = TokenPools.ICP_XP;
    const latestTransactions = await collector.getTrxUntilId(poolId, targetTransactionId);
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
