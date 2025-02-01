import { kongswap } from "..";
import { icswap } from "..";
import { Event as SonicTransaction } from "../actors/sonic/sonicSwapCapRoot";
export enum TransactionSource {
    KONGSWAP = "KONGSWAP",
    ICPSWAP = "ICPSWAP",
    SONIC = "SONIC",
}

export enum TransactionType {
    SWAP = "SWAP",
    ADD_LIQUIDITY = "ADD_LIQUIDITY",
    DECREASE_LIQUIDITY = "DECREASE_LIQUIDITY",
    CREATE_POOL = "CREATE_POOL",
    CLAIM = "CLAIM",
    MINT = "MINT",
}

export type TransactionInfo = {
    /**
     * Transaction type
     */
    type: TransactionType;
    /**
     * Transaction source
     */
    source: TransactionSource;
    /**
     * Transaction ID based on the source
     */
    id: string;
    /**
     * PID (Canister or User)
     */
    from: string;
    /**
     * PID (Canister or User)
     */
    to: string;
    /**
     * Transaction timestamp
     */
    ts: bigint;
    /**
     * Raw transaction return from the source
     */
    raw: kongswap.Transaction | icswap.Transaction | SonicTransaction;
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
