import { kongswap } from "..";

export enum TransactionSource {
    KONGSWAP = "KONGSWAP",
    ICPSWAP = "ICPSWAP",
}

export enum TransactionType {
    SWAP = "SWAP",
    ADD_LIQUIDITY = "ADD_LIQUIDITY",
    REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
    CREATE_POOL = "CREATE_POOL",
}

export type TransactionInfo = {
    /**
     * Transaction timestamp
     */
    ts: bigint;
    /**
     * Transaction ID based on the source
     */
    id: string;
    /**
     * Transaction source
     */
    source: TransactionSource;
    /**
     * Raw transaction return from the source
     */
    raw: kongswap.Transaction;
    /**
     * Transaction type
     */
    type: TransactionType;
};

export type SwapTransaction = TransactionInfo & {
    tokenIn: string;
    amountIn: bigint;
    tokenOut: string;
    amountOut: bigint;
    slippage: number;
};

export type AddLiquidityTransaction = TransactionInfo & {
    token1: string;
    token2: string;
    amount1: bigint;
    amount2: bigint;
};

export type RemoveLiquidityTransaction = TransactionInfo & {
    token1: string;
    token2: string;
    amount1: bigint;
    amount2: bigint;
};

export type CreatePoolTransaction = TransactionInfo & {
    token1: string;
    token2: string;
    amount1: bigint;
    amount2: bigint;
};

export type Transaction =
    | SwapTransaction
    | AddLiquidityTransaction
    | RemoveLiquidityTransaction
    | CreatePoolTransaction;
