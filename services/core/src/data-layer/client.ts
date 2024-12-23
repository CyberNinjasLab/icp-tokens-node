import { Pool } from 'pg';

import { Config } from './../config';

export class DatabaseClient {

  private static instance: Pool | null = null;

  private static config = Config.getInstance();

  public static getInstance(): Pool {
    if (!this.instance) {
        this.instance = new Pool({
          ...this.config.postgressConfig,
          max: 30, // Maximum number of clients in the pool
          idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
          connectionTimeoutMillis: 2000, // Wait up to 2 seconds for a new connection
        });
    }

    return this.instance;
  }
}
