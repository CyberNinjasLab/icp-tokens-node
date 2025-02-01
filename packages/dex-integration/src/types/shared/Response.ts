import { Account } from "@dfinity/ledger-icrc/dist/candid/icrc_index";
import * as icpswap from "../ICPSwap";
import * as kongswap from "../KongSwap";
import { LPInfo } from "./LPInfo";

export enum LedgerTransactionType {
    Transfer = "transfer",
    Approve = "approve",
}

export type LedgerApproveTx = {
    address: string;
    blockId: bigint;
    amount: bigint;
    timestamp: number;
    type: LedgerTransactionType.Approve;
    from: Account;
    spender: Account;
};

export type LedgerTransferTx = {
    address: string;
    blockId: bigint;
    amount: bigint;
    timestamp: number;
    type: LedgerTransactionType.Transfer;
    from: Account;
    to: Account;
};

export type LedgerTx = LedgerApproveTx | LedgerTransferTx;

export type PrepareSwapResponse = Array<LedgerTx>;
export type SwapResponse = bigint;
export type QuoteResponse = bigint;
export type GetMetadataResponse = icpswap.PoolMetadata | kongswap.PoolMetadata | null;
export type PoolInfoResponse = icpswap.PoolInfo | kongswap.PoolInfo | kongswap.NonLPPool | null;
export type GetLPInfoResponse = LPInfo | null;
