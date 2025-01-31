import { Sequelize } from 'sequelize';
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
