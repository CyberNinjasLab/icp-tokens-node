import { Sequelize, Options as SequelizeOptions } from 'sequelize';

// Logger interface for dependency injection
export interface Logger {
  info(message: string, context?: string): void;
  error(message: string, context?: string): void;
  debug?(message: string, context?: string): void;
  warn?(message: string, context?: string): void;
}

// Default logger implementation
class DefaultLogger implements Logger {
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
  minConnections?: number;
  idleTimeout?: number;
  acquireTimeout?: number;
  logging?: boolean;
}

export class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  public sequelize: Sequelize;
  private logger: Logger;
  private logContext = 'DatabaseClient';

  /**
   * DatabaseClient constructor
   * @param config Database configuration
   * @param logger Custom logger implementation (optional)
   */
  constructor(config: DatabaseConfig, logger?: Logger) {
    this.logger = logger || new DefaultLogger();

    const sequelizeConfig: SequelizeOptions = {
      dialect: 'postgres',
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.user,
      password: config.password,
      logging: config.logging ? (msg) => this.logger.debug?.(msg, this.logContext) : false,
      pool: {
        max: config.maxConnections || 10,
        min: config.minConnections || 0,
        acquire: config.acquireTimeout || 30000,
        idle: config.idleTimeout || 10000,
      },
    };

    this.sequelize = new Sequelize(sequelizeConfig);
    this.init();
  }

  /**
   * Initialize the database connection
   */
  private async init(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      this.logger.info(`Database connected successfully`, this.logContext);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Database connection error: ${errorMessage}`, this.logContext);
      throw err;
    }
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      await this.sequelize.close();
      this.logger.info(`Database connection closed`, this.logContext);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error closing database connection: ${errorMessage}`, this.logContext);
      throw err;
    }
  }

  /**
   * Get singleton instance of DatabaseClient
   * @param config Database configuration
   * @param logger Custom logger implementation
   */
  public static getInstance(config: DatabaseConfig, logger?: Logger): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient(config, logger);
    }

    return DatabaseClient.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (DatabaseClient.instance) {
      try {
        DatabaseClient.instance.sequelize.close();
      } catch (e) {
        // Ignore errors during reset
      }
      DatabaseClient.instance = null;
    }
  }
}