import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;

export class Config {

  public postgressConfig = {
    host: 'icptokens-svc',
    port: 5432,
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRESS_DB || '',
  }

  private static instance: Config;

  public static getInstance(): Config {
    if (!Config.instance) {
        console.log(process.env.POSTGRES_USER);

      Config.instance = new Config();
    }

    return Config.instance;
  }

}
