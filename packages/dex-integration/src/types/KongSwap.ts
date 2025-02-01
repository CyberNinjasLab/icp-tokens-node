import {
    AddLiquidityReply,
    AddPoolReply,
    PoolReply,
    RemoveLiquidityReply,
    SwapReply,
} from "./actors/kongswap/kongBase";
import { Token as GeneralToken, PoolData } from "./shared";

export type Token = GeneralToken & {
    fee: bigint;
    decimals: number;
    token_id: number;
    chain: string;
    canister_id: string;
    icrc1: boolean;
    icrc2: boolean;
    icrc3: boolean;
};

export type SwapInput = {
    tokenIn: string;
    amountIn: bigint;
    tokenOut: string;
    amountOut: bigint;
    slippage: number;
};

export type PoolMetadata = PoolReply;

/**
 * Pool that can be swapped and have a pool
 */
export type LPPool = PoolReply & PoolData;
/**
 * Pair that can be swapped but don't have a pool
 */
export type NonLPPool = PoolData;

export type PoolInfo = LPPool | NonLPPool;

export type Transaction = AddLiquidityReply | SwapReply | AddPoolReply | RemoveLiquidityReply;
