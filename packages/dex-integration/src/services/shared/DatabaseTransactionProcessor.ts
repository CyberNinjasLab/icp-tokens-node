import { DatabaseClient, DatabaseConfig, QueryHelper } from '@icptokens/db-client';

import { TransactionSource, TransactionType, Transaction } from '../../types/shared/Transaction';
import { ICPSwap } from '../icpswap/ICPSwap';

/**
 * Service for processing and storing DEX transactions in the database
 */
export class DatabaseTransactionProcessor {
  private icpSwap: ICPSwap;
  private readonly dexServiceName: string;
  private db: DatabaseClient;
  private queryHelper: QueryHelper;
  
  /**
   * Create a new DatabaseTransactionProcessor instance
   * @param dexServiceName - The name of the DEX service (e.g., 'ICPSWAP', 'KONGSWAP', 'SONIC')
   * @param icpSwap - Instance of ICPSwap provider
   * @param dbConfig - Database configuration
   */
  constructor(
    dexServiceName: TransactionSource | string, 
    icpSwap: ICPSwap, 
    dbConfig: DatabaseConfig
  ) {
    this.dexServiceName = dexServiceName;
    this.icpSwap = icpSwap;
    
    // Initialize database client
    this.db = DatabaseClient.getInstance(dbConfig);
    this.queryHelper = new QueryHelper(this.db);
  }

  /**
   * Initialize the storage canister
   * @returns The ID of the initialized canister
   */
  async initialize(): Promise<string> {
    const canisters = await this.icpSwap.getBaseStorageCanisters();
    if (canisters.length === 0) {
      throw new Error('No storage canisters found');
    }
    await this.icpSwap.setBaseStorageActor(canisters[0]);
    return canisters[0];
  }

  /**
   * Get the last processed transaction from the database
   * @param canisterId - The ID of the canister
   * @returns The full transaction ID (canisterId.index) or null if none found
   */
  async getLastProcessedTransaction(canisterId: string): Promise<string | null> {
    const pointers = await this.queryHelper.rawQuery<{ transaction_index: string }>(
      `SELECT transaction_index FROM icptokens.pointers 
       WHERE dex_service_name = :dexServiceName AND canister_id = :canisterId`,
      {
        replacements: { 
          dexServiceName: this.dexServiceName,
          canisterId
        }
      }
    );
    
    if (!pointers || pointers.length === 0) {
      return null;
    }
    
    return `${canisterId}.${pointers[0].transaction_index}`;
  }

  /**
   * Save transactions to the database
   * @param transactions - Array of transactions to save
   * @param canisterId - The canister ID
   * @returns The ID of the last transaction saved
   */
  async saveTransactions(transactions: Transaction[], canisterId: string): Promise<string> {
    if (!transactions || transactions.length === 0) {
      return '';
    }
    
    let lastTransactionId = '';
    
    // Use withTransaction helper to manage the transaction
    await this.queryHelper.withTransaction(async (transaction) => {
      console.log(`Saving ${transactions.length} transactions to the database...`);

      // Process transactions in chunks to avoid query size limits
      const CHUNK_SIZE = 100;
      for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
        const chunk = transactions.slice(i, i + CHUNK_SIZE);
        
        // Prepare batch inserts
        const transactionsToInsert = chunk.map(tx => {
          // Extract the transaction ID and store the last one
          const txId = tx.id;
          lastTransactionId = txId;
          
          return {
            id: txId,
            type: tx.type,
            source: tx.source,
            from: tx.from,
            to: tx.to,
            ts: tx.ts.toString(),
            raw: JSON.stringify(tx.raw),
            token_in: 'tokenIn' in tx ? tx.tokenIn : null,
            amount_in: 'amountIn' in tx ? tx.amountIn.toString() : null,
            token_out: 'tokenOut' in tx ? tx.tokenOut : null,
            amount_out: 'amountOut' in tx ? tx.amountOut.toString() : null,
            slippage: 'slippage' in tx ? tx.slippage : null,
            token1: 'token1' in tx ? tx.token1 : null,
            token2: 'token2' in tx ? tx.token2 : null,
            amount1: 'amount1' in tx ? tx.amount1.toString() : null,
            amount2: 'amount2' in tx ? tx.amount2.toString() : null,
            created_at: new Date()
          };
        });
        
        // Use the batchInsert helper to insert records
        await this.queryHelper.batchInsert('transactions', transactionsToInsert, {
          schema: 'icptokens',
          transaction,
          onConflict: 'ON CONFLICT (id, source) DO NOTHING'
        });
      }
      
      // Update the pointer to the last processed transaction
      if (transactions.length > 0) {
        const lastTx = transactions[transactions.length - 1];
        const transactionIdParts = lastTx.id.split('.');
        const transactionIndex = BigInt(transactionIdParts[transactionIdParts.length - 1]);
        
        await this.queryHelper.rawQuery(
          `INSERT INTO icptokens.pointers (dex_service_name, canister_id, transaction_index, updated_at)
           VALUES (:dexServiceName, :canisterId, :transactionIndex, NOW())
           ON CONFLICT (dex_service_name, canister_id) 
           DO UPDATE SET 
             transaction_index = :transactionIndex,
             updated_at = NOW()`,
          {
            replacements: {
              dexServiceName: this.dexServiceName,
              canisterId,
              transactionIndex: transactionIndex.toString()
            },
            transaction
          }
        );
      }
    });
    
    console.log(`Successfully saved ${transactions.length} transactions. Last ID: ${lastTransactionId}`);
    
    // Return the last transaction ID for continuation
    return lastTransactionId;
  }

  /**
   * Process transactions in batches
   * @param batchSize - Number of transactions to process in each batch
   * @param maxBatches - Maximum number of batches to process
   * @returns Total number of transactions processed
   */
  async processTransactionsInBatches(batchSize = 1000, maxBatches = 10): Promise<number> {
    try {
      // Initialize the storage canister
      const canisterId = await this.initialize();
      console.log(`Working with canister: ${canisterId}`);

      // Get the last processed transaction ID
      let lastTxId = await this.getLastProcessedTransaction(canisterId);
      console.log(`Last processed transaction ID: ${lastTxId || 'None (starting from beginning)'}`);

      // Process batches
      let batchCount = 0;
      let totalProcessed = 0;
      
      while (batchCount < maxBatches) {
        console.log(`\nProcessing batch ${batchCount + 1}/${maxBatches}`);
        
        // Get transactions after the last ID
        const transactions = await this.icpSwap.getTrxsAfterTrxId(
          lastTxId || `${canisterId}.0`, 
          batchSize
        );
        
        if (transactions.length === 0) {
          console.log('No more transactions to process');
          break;
        }
        
        console.log(`Retrieved ${transactions.length} transactions`);
        
        // Save transactions and get the last ID
        lastTxId = await this.saveTransactions(transactions, canisterId);
        
        totalProcessed += transactions.length;
        batchCount++;
        
        console.log(`Processed ${totalProcessed} transactions in total`);
        
        // If we got fewer transactions than the batch size, we've reached the end
        if (transactions.length < batchSize) {
          console.log('Reached the end of available transactions');
          break;
        }
      }
      
      console.log(`\nCompleted processing. Total transactions: ${totalProcessed}`);
      return totalProcessed;
    } catch (error) {
      console.error('Error processing transactions:', error);
      throw error;
    }
  }
  
  /**
   * Close the database connection
   */
  async closeConnection(): Promise<void> {
    await this.db.close();
  }
}