import { Transaction, TransactionRange } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger";
import { AgentCanister } from "ic0";

export interface Config {
  debug?: boolean;
  parallelBatches?: number;
}

export interface LedgerInstance {
  ic: AgentCanister
  debug: boolean;
  parallel_batches: number;
}

export interface ArchiveBatch {
  startIndex: bigint;
  batch: TransactionRange;
}

export interface FormattedTransaction {
  index: bigint,
  type: 'transfer' | 'burn' | 'mint' | 'approve';
  from?: From,
  to?: To,
  value: bigint,
  fee?: bigint,
  memo: string,
  timestamp: bigint | undefined,
  raw_data: Transaction
}

export interface From {
  account: string | undefined,
  principal: string,
  subaccount?: string
}

export interface To {
  account: string | undefined,
  principal: string,
  subaccount?: string
}