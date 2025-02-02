import { Ledger, FormattedTransaction } from "@icptokens/token-toolkit";

import TransactionDataLayer from './../data-layer/transaction.data-layer';

const ledger = new Ledger("ryjl3-tyaaa-aaaaa-aaaba-cai");

class TransactionService {
  /**
   * Fetch transactions from the ICP Ledger and store them in the database.
   */
  public async fetchAndStoreTransactions() {
    console.log("🔄 Fetching ICP Ledger transactions...");

    // Get the latest transaction ID from the database
    const latestTxId = await TransactionDataLayer.getLatestTransactionId();
    console.log(`✅ Latest transaction in DB: ${latestTxId}`);

    // Fetch transactions starting from the latest ID
    await ledger.iterateTransactions(async (batch: FormattedTransaction[]) => {
      for (const tx of batch) {
        if (latestTxId && tx.index <= latestTxId) {
          console.log(`⚠️ Skipping already stored transaction: ${tx.index}`);
          continue;
        }

        // Prepare transaction data
        const txData = {
          id: tx.index,
          type: tx.type,
          from_account: tx.from?.account,
          from_principal: tx.from?.principal,
          to_account: tx.to?.account,
          to_principal: tx.to?.principal,
          value: tx.value,
          fee: tx.fee || BigInt(0),
          memo: tx.memo,
          timestamp: new Date(Number(tx.timestamp) / 1_000_000), // Convert from nanoseconds
          raw_data: tx.raw_data,
        };

        // Store in database
        await TransactionDataLayer.upsertTransaction(txData);
        console.log(`✅ Stored transaction: ${tx.index}`);
      }
      return true; // Continue fetching transactions
    });

    console.log("✅ Finished fetching transactions.");
  }
}

export default TransactionService;
