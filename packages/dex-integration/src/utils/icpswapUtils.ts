import { AddLiquidityTransaction, ClaimTransaction, icswap, RemoveLiquidityTransaction, SwapTransaction, Transaction, TransactionInfo, TransactionSource, TransactionType } from "../types";

export const parseICPSwapTransaction = (
    tx: any, 
    storageCanisterId: string,
    offset: bigint, 
    index: number,
    poolId?: string
  ): Transaction | null => {
    const baseInfo: TransactionInfo = {
      from: tx.from,
      to: tx.to,
      ts: tx.timestamp,
      id: poolId 
        ? `${storageCanisterId}.${poolId}.${offset + BigInt(index)}`
        : `${storageCanisterId}.${offset + BigInt(index)}`,
      source: TransactionSource.ICPSWAP,
      raw: tx as unknown as icswap.Transaction,
      type: TransactionType.SWAP // Default type if no match
    };
  
    if ('swap' in tx.action) {
      return {
        ...baseInfo,
        type: TransactionType.SWAP,
        tokenIn: tx.token0Symbol,
        amountIn: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))),
        tokenOut: tx.token1Symbol,
        amountOut: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals))),
        slippage: 0
      } as SwapTransaction;
    } 
    
    if ('addLiquidity' in tx.action || 'increaseLiquidity' in tx.action) {
      return {
        ...baseInfo,
        type: TransactionType.ADD_LIQUIDITY,
        token1: tx.token0Symbol,
        token2: tx.token1Symbol,
        amount1: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))),
        amount2: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals)))
      } as AddLiquidityTransaction;
    } 
    
    if ('decreaseLiquidity' in tx.action) {
      return {
        ...baseInfo,
        type: TransactionType.DECREASE_LIQUIDITY,
        token1: tx.token0Symbol,
        token2: tx.token1Symbol,
        amount1: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))),
        amount2: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals)))
      } as RemoveLiquidityTransaction;
    }

    if ('claim' in tx.action) {
      return {
        ...baseInfo,
        type: TransactionType.CLAIM,
        token1: tx.token0Symbol,
        token2: tx.token1Symbol,
        amount1: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))),
        amount2: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals)))
      } as ClaimTransaction;
    }

    // big int serialize and json stringify
    // console.log(`Unknown transaction type: ${JSON.stringify(tx)}`);
  
    return null;
  }