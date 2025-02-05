import { AgentCanister } from "ic0";

/**
 * Global configuration for the Ledger instance
 */
export interface Config {
  debug?: boolean;
  parallelBatches?: number;
}

/**
 * Represents the structure of an ICP Ledger instance
 */
export interface LedgerInstance {
  ic: AgentCanister;
  debug: boolean;
  parallel_batches: number;
}

/**
 * Archive Batch - Used for handling archived transactions
 */
export interface ArchiveBatch {
  startIndex: bigint;
  batch: IcpQueryBlocksResponse;
}

/**
 * Common Formatted Transaction Structure (Specific to ICP Ledger)
 */
export interface FormattedTransaction {
  index: bigint;
  type: 'transfer' | 'burn' | 'mint';
  from: string;
  to: string;
  value: bigint | null;
  fee: bigint | null;
  memo: string;
  timestamp: Date;
  raw_data?: IcpBlock; // Raw transaction data from ICP Ledger
}


/**
 * Structure for the 'from' field in a transaction
 */
export interface From {
  account?: string;
  principal: string;
  subaccount?: string;
}

/**
 * Structure for the 'to' field in a transaction
 */
export interface To {
  account?: string;
  principal: string;
  subaccount?: string;
}

/**
 * ICP Block structure (to match `query_blocks` response)
 */
export interface IcpBlock {
  transaction: {
    memo?: number;
  };
  operation?: {
    Transfer?: {
      from?: string;
      to?: string;
      amount: bigint;
      fee?: bigint;
    };
    Mint?: {
      to?: string;
      amount: bigint;
    };
    Burn?: {
      from?: string;
      amount: bigint;
    };
  };
  timestamp: {
    timestamp_nanos: bigint;
  };
}

/**
 * Response format for ICP Ledger `query_blocks`
 */
export interface IcpQueryBlocksResponse {
  chain_length: bigint;
  blocks: IcpBlock[];
}
