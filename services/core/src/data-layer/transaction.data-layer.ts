import { QueryTypes } from "sequelize";
import Transaction, { ITransaction } from "../models/transaction.model";

class TransactionDataLayer {

  private static logContext = `TransactionDataLayer`;

  static async upsertTransaction(txData: ITransaction): Promise<void> {
    await Transaction.upsert(txData)
      .catch(err => {
        logger.error(err, `${this.logContext} -> upsertTransaction()`);
      });
  }

  static async getLatestTransactionById(): Promise<Transaction | void | null> {
    const latestTx = await Transaction.findOne({ order: [["id", "DESC"]] })
      .catch(err => {
        logger.error(err, `${this.logContext} -> getLatestTransactionById`);
      });

    return latestTx;
  }

  static async getMissingTransactionIds(totalTransactions: bigint): Promise<bigint[] | number> {
    const missingIds: bigint[] = [];
    // Define a batch size (adjust as needed)
    const batchSize = BigInt(20000);

    // Process the range in batches.
    for (let batchStart = BigInt(0); batchStart < totalTransactions; batchStart += batchSize) {
      let batchEnd = batchStart + batchSize;
      if (batchEnd > totalTransactions) {
        batchEnd = totalTransactions;
      }

      // Use '?' as placeholders when using an array of replacements.
      const query = `
        WITH expected_ids AS (
          SELECT generate_series(?::bigint, ?::bigint - 1) AS id
        )
        SELECT e.id
        FROM expected_ids e
        WHERE NOT EXISTS (
          SELECT 1 FROM transactions t WHERE t.id = e.id
        );
      `;

      const results = await Transaction.sequelize!.query<{ id: string }>(query, {
        replacements: [batchStart.toString(), batchEnd.toString()],
        type: QueryTypes.SELECT,
      }).catch(err => {
        logger.error(err, `${this.logContext} -> getMissingTransactionIds() for range ${batchStart} to ${batchEnd}`);
      });

      if (!results) {
        logger.error('Results not found.', `${this.logContext} - getMissingTransactionIds() for range ${batchStart} to ${batchEnd}`);

        continue;
      }

      if (results.length === 0) {
        continue;
      }

      missingIds.push(...results.map(row => BigInt(row.id)));
    }

    if (missingIds.length === 0) {
      return 0;
    }

    return missingIds;
  }

  static async getTransactionsByDateRange(start: Date, end: Date): Promise<Transaction[]> {
    return await Transaction.findAll({
      where: {
        timestamp: { $between: [start, end] },
      },
      order: [["timestamp", "DESC"]],
    });
  }

  static async bulkInsertTransactions(transactions: ITransaction[]) {
      if (transactions.length === 0) return;

      await Transaction.bulkCreate(transactions, {
        ignoreDuplicates: true,
        validate: true,
      }).catch(err => {
        logger.error(err, `${this.logContext} -> bulkInsertTransactions()`);
      });
  }
  
}

export default TransactionDataLayer;
