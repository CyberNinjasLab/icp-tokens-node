import { Sequelize } from 'sequelize';

import TransactionService from './../services/transaction.service';
import AccountService from './../services/account.service';

import Account from './../models/account.model';
import Transaction from './../models/transaction.model';
import AccountBalance from '../models/account-balance.model';

import { Config } from './../config';

const config = Config.getInstance();

class DatabaseClient {

  constructor() {
    this.init();
  }

  private logContext = 'DatabaseClient';

  public sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.postgressConfig.host,
    port: Number(config.postgressConfig.port),
    database: config.postgressConfig.database,
    username: config.postgressConfig.user,
    password: config.postgressConfig.password,
    logging: false, // Disable logging for production
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  private async init(): Promise<void> {
    await this.sequelize.authenticate()
      .then(() => logger.info(`[${this.logContext}] Database connected`))
      .catch((err) => logger.error(`Database connection error: ${err.message}`, `${this.logContext} -> init()`));

      Account.initialize(this.sequelize);
      AccountBalance.initialize(this.sequelize);
      Transaction.initialize(this.sequelize);

      await AccountService.createAccountsFromTransactionsInBatches();

      // Define associations between Account and Transaction:
      // (Assuming from_account and to_account store the Account.account_identifier)

      Account.hasMany(Transaction, {
        foreignKey: "from_account",
        sourceKey: "account_identifier",
        as: "SentTransactions",
      });

      Account.hasMany(Transaction, {
        foreignKey: "to_account",
        sourceKey: "account_identifier",
        as: "ReceivedTransactions",
      });

      Transaction.belongsTo(Account, {
        as: "FromAccount",
        foreignKey: "from_account",
        targetKey: "account_identifier",
      });

      Transaction.belongsTo(Account, {
        as: "ToAccount",
        foreignKey: "to_account",
        targetKey: "account_identifier",
      });

      // Define association between Account and AccountBalance:
      Account.hasMany(AccountBalance, {
        foreignKey: "account_identifier",
        sourceKey: "account_identifier",
      });
      AccountBalance.belongsTo(Account, {
        foreignKey: "account_identifier",
        targetKey: "account_identifier",
      });


      await this.sequelize.sync({ alter: true });

      const transactionService = new TransactionService();

      await transactionService.getNewTransactions();
  }

  public async close(): Promise<void> {
    await this.sequelize.close()
      .then(() => logger.info(`[${this.logContext}] Database connection closed`))
      .catch((err) => logger.error(`Error closing database connection: ${err.message}`, `${this.logContext} -> close()`));
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }

    return DatabaseClient.instance;
  }

  private static instance: DatabaseClient;
}

const db = DatabaseClient.getInstance();

export default db;
