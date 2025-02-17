import { IcpLedger } from "@icptokens/token-toolkit";
import { Op } from "sequelize";

import AccountDataLayer from './../data-layer/account.data-layer';

import Transaction from './../models/transaction.model';
import Account from './../models/account.model';

import PerformanceUtil from './../utils/performance.util';

const performanceUtil = PerformanceUtil.getInstance();

class AccountService {

  private static logContext = "Account Service";

  constructor() {}

  /**
   * Processes all transactions in batches (using findAll with a limit)
   * to collect unique account identifiers from both `from_account` and `to_account`.
   * After processing, it inserts new Account records in batches.
   *
   * @param findBatchSize Number of transactions to fetch per batch (default is 2000)
   * @param insertBatchSize Number of account records to insert per batch (default is 1000)
   */
  public static async createAccountsFromTransactionsInBatches(findBatchSize = 5000, insertBatchSize = 5000): Promise<void> {

    logger.info(`${this.logContext} | Fetching ICP Ledger transactions`);

    const startTime = performance.now();

    // We'll use the transaction primary key (id) for batch pagination.
    let lastTimestamp = new Date(0);
    let batchCounter = 0;

    while (true) {
        // Fetch a batch of transactions ordered by timestamp.
        // (If many transactions share the same timestamp, consider adding a secondary order, e.g. by id.)
        const transactions = await Transaction.findAll({
          attributes: ["id", "from_account", "to_account", "timestamp"],
          where: { timestamp: { [Op.gt]: lastTimestamp } },
          order: [["timestamp", "ASC"]],
          limit: findBatchSize,
          raw: true
        });
  
        // If no transactions are returned, we're done.
        if (transactions.length === 0) {
          break;
        }
  
        // Update lastTimestamp to the timestamp of the last transaction in this batch.
        lastTimestamp = (transactions as any)[transactions.length - 1].timestamp;
  
        // Collect unique account identifiers from the current batch.
        const batchAccountIdentifiers = new Set<string>();
        for (const tx of transactions as any) {
          if (tx.from_account) {
            batchAccountIdentifiers.add(tx.from_account);
          }
          if (tx.to_account) {
            batchAccountIdentifiers.add(tx.to_account);
          }
        }
  
        // Convert the set to an array and prepare account records.
        const accountsToInsert = Array.from(batchAccountIdentifiers).map((account_identifier) => ({
          account_identifier,
          principal: account_identifier // Adjust if your logic requires a different principal.
        }));
  
        // Immediately insert the accounts from this batch.
        await AccountDataLayer.bulkCreateAccounts(accountsToInsert);
  
        batchCounter++;
        console.log(`Processed batch ${batchCounter}: Inserted ${accountsToInsert.length} accounts.`);
      }

    const time = performanceUtil.getPerformance(startTime);
    console.log(`${this.logContext} | Inserted all accounts in batches. Time: ${time}`);
  }
}

export default AccountService;
