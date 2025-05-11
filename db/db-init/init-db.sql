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

-- Create enum types for transaction sources and types
CREATE TYPE icptokens.transaction_source AS ENUM ('KONGSWAP', 'ICPSWAP', 'SONIC');
CREATE TYPE icptokens.transaction_type AS ENUM ('SWAP', 'ADD_LIQUIDITY', 'DECREASE_LIQUIDITY', 'CREATE_POOL', 'CLAIM', 'MINT');

-- Create the base transaction table
CREATE TABLE IF NOT EXISTS icptokens.transactions (
  id TEXT NOT NULL,
  type icptokens.transaction_type NOT NULL,
  source icptokens.transaction_source NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  ts BIGINT NOT NULL,
  raw JSONB NOT NULL,
  token_in TEXT,
  amount_in BIGINT,
  token_out TEXT,
  amount_out BIGINT,
  slippage NUMERIC,
  token1 TEXT,
  token2 TEXT,
  amount1 BIGINT,
  amount2 BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, source)
);

-- Create an index on the timestamp for faster querying
CREATE INDEX idx_transactions_ts ON icptokens.transactions(ts);
-- Create indexes for token pairs
CREATE INDEX idx_transactions_token_pair ON icptokens.transactions(token1, token2);
CREATE INDEX idx_transactions_swap_tokens ON icptokens.transactions(token_in, token_out);
-- Create index for transaction type
CREATE INDEX idx_transactions_type ON icptokens.transactions(type);
-- Create index for transaction source
CREATE INDEX idx_transactions_source ON icptokens.transactions(source);


-- Create pointer table to keep track of last processed transaction from each DEX service
CREATE TABLE IF NOT EXISTS icptokens.pointers (
  dex_service_name TEXT NOT NULL,
  canister_id TEXT NOT NULL,
  transaction_index BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (dex_service_name, canister_id)
);

-- Create index for faster lookups
CREATE INDEX idx_pointers_dex_service ON icptokens.pointers(dex_service_name);


SELECT create_hypertable('icptokens.trading_data', 'time', if_not_exists => TRUE);
