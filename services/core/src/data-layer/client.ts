import { Sequelize } from 'sequelize';

import { Config } from './../config';

const config = Config.getInstance();

class DatabaseClient {

  constructor() {
    this.init();
  }

  public sequelize = new Sequelize(this.getUrl(),
  {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Disable logging for production
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  private logContext = 'DataBaseClient';

  private getUrl(): string {
    return `postgres://${config.postgressConfig.user}:${config.postgressConfig.password}@${config.postgressConfig.host}:${config.postgressConfig.port}/${config.postgressConfig.database}`;
  }

  private async init(): Promise<void> {
    await this.sequelize.authenticate()
      .then(() => logger.info('Database connected'))
      .catch((err) => logger.error(err.message, this.logContext));
  }
}

const db = new DatabaseClient();

export default db.sequelize;
