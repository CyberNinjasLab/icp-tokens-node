-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create schema (optional)
CREATE SCHEMA IF NOT EXISTS icptokens;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
GRANT ALL PRIVILEGES ON SCHEMA icptokens TO myuser;

CREATE TABLE IF NOT EXISTS icptokens.trading_data (
  date TIMESTAMPTZ NOT NULL,
  symbol TEXT NOT NULL,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  volume BIGINT,
  PRIMARY KEY (date, symbol)
);

SELECT create_hypertable('icptokens.trading_data', 'time', if_not_exists => TRUE);