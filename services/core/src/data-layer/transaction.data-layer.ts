import Transaction, { ITransaction } from "../models/transaction.model";

class TransactionDataLayer {

  static async upsertTransaction(txData: ITransaction): Promise<void> {
    await Transaction.upsert(txData);
  }

  static async getLatestTransactionId(): Promise<bigint | null> {
    const latestTx = await Transaction.findOne({
      order: [["id", "DESC"]],
    });
    return latestTx ? latestTx.id : null;
  }

  static async getTransactionsByDateRange(start: Date, end: Date): Promise<Transaction[]> {
    return await Transaction.findAll({
      where: {
        timestamp: { $between: [start, end] },
      },
      order: [["timestamp", "DESC"]],
    });
  }
}

export default TransactionDataLayer;
