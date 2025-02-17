import { IcpLedger } from "@icptokens/token-toolkit";

import TransactionDataLayer from "./../data-layer/transaction.data-layer";

import PerformanceUtil from "./../utils/performance.util";

import Transaction, { ITransaction } from "./../models/transaction.model";
import { col, fn, literal } from "sequelize";

const performanceUtil = PerformanceUtil.getInstance();

class TransactionService {

  constructor() {

  }

  private logContext = `Transaction Service`;

  private ledger = new IcpLedger();

  public async getNewTransactions(): Promise<void> {
    const logContext = `${this.logContext} -> fetchAndStoreTransactions`;

      logger.info(`${logContext} | Fetching ICP Ledger transactions`);

      const startTime = performance.now();

      const latestTransactionId = await TransactionDataLayer.getLatestTransactionById();

      if (!latestTransactionId) {
        logger.error('Latest Transaction not found.', logContext);

        return;
      }

      logger.info(`${logContext} | Latest transaction in DB: ${latestTransactionId?.dataValues.id}`);

      // Array to store transactions before bulk insert
      const transactionsToInsert: ITransaction[] = [];

      await this.ledger.iterateNewTransactions(latestTransactionId.dataValues.id, async (batch) => {
          if (batch.length === 0) return true;
      
          const transactionsToInsert = batch
            .map((transaction) => ({
                id: transaction.index,
                type: transaction.type,
                from_account: transaction.from,
                to_account: transaction.to,
                value: transaction.value,
                fee: transaction.fee ? transaction.fee : BigInt(0),
                memo: transaction.memo || "",
                timestamp: transaction.timestamp,
            }));
      
          await TransactionDataLayer.bulkInsertTransactions(transactionsToInsert as unknown as ITransaction[]);

          return true; // Continue fetching transactions
      });

      // **Insert remaining transactions**
      if (transactionsToInsert.length > 0) {
          await TransactionDataLayer.bulkInsertTransactions(transactionsToInsert);
      }

      const totalTime = performanceUtil.getPerformance(startTime);

      logger.info(`✅ Finished fetching transactions. Time: ${totalTime}`);
  }

  public async getOldTransactions(): Promise<void> {
    const logContext = `${this.logContext} -> getOldTransactions`;
    logger.info(`${logContext} | Fetching missing/old ICP Ledger transactions`);

    const startTime = performance.now();

    // 1. Retrieve the current total transactions count from the ledger.
    const totalTransactions = await this.ledger.getTotalTransactions();
    logger.info(`${logContext} | Total transactions on ledger: ${totalTransactions}`);

    // 2. Get missing transaction IDs in the range [0, totalTransactions)
    //    (This method is external to the ledger package.)
    const missingIds = await TransactionDataLayer.getMissingTransactionIds(totalTransactions);

    console.log(missingIds);

    if (!Array.isArray(missingIds) || missingIds.length === 0) {
      logger.info(`${logContext} | No missing transactions found.`);

      return;
    }

    logger.info(`${logContext} | Found ${missingIds.length} missing transactions. Processing...`);

    await this.ledger.iterateMissingTransactions(missingIds, async (batch) => {
      if (batch.length === 0) return true;

      // Map ledger transaction format to ITransaction.
      const transactionsToInsert = batch.map((transaction) => ({
        id: transaction.index,
        type: transaction.type,
        from_account: transaction.from,
        to_account: transaction.to,
        value: transaction.value,
        fee: transaction.fee ? transaction.fee : BigInt(0),
        memo: transaction.memo || "",
        timestamp: transaction.timestamp,
      }));

      await TransactionDataLayer.bulkInsertTransactions(transactionsToInsert as unknown as ITransaction[]);

      return true; 
    });

    const totalTime = performanceUtil.getPerformance(startTime);
    logger.info(`✅ Finished fetching old transactions. Time: ${totalTime}`);
  }

  public async getDailyReceived(accountIdentifier: string) {
    const results = await Transaction.findAll({
      attributes: [
        [fn('date_trunc', 'day', col('timestamp')), 'day'],
        [fn('SUM', col('value')), 'total_received']
      ],
      where: {
        to_account: accountIdentifier,
        type: 'transfer' // You can extend this for other types if needed.
      },
      group: [fn('date_trunc', 'day', col('timestamp'))],
      order: [[literal('day'), 'ASC']]
    });

    return results.map((row: any) => ({
      day: row.getDataValue('day'),
      total_received: parseInt(row.getDataValue('total_received'), 10)
    }));
  }


}

export default TransactionService;
