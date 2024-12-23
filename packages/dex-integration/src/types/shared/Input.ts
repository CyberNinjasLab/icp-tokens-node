import { LedgerTx } from "./Response";
import { Token } from "./Token";

export type PrepareSwapInput = SwapInput & {
    approveAmount: bigint;
};

export type SwapInput = {
    tokenIn: Token;
    amountIn: bigint;
    amountOut: bigint;
    slippage: number;
    ledgerTxs?: Array<LedgerTx>;
};

export type QuoteInput = {
    tokenIn: Token;
    amountIn: bigint;
    slippage: number;
};

export type ListPoolInput = Token;

export type GetPoolInput = Token;
