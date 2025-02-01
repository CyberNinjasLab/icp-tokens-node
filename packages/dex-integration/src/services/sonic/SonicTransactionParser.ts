// import { AddLiquidityTransaction, CreatePoolTransaction, RemoveLiquidityTransaction, SwapTransaction, TransactionSource, TransactionType } from "../../types";

// export class SonicTransactionParser {
//   static parseRawTransactions(rawTxs: RawTransaction[]): Transaction[] {
//       return rawTxs.map((rawTx) => {
//           const { time, operation, details, caller } = rawTx;
//           const ts = BigInt(time);
          
//           switch (operation) {
//               case "swap": {
//                   const poolId = this.extractDetail(details, "poolId");
//                   const amountIn = BigInt(this.extractDetail(details, "amountIn"));
//                   const amountOut = BigInt(this.extractDetail(details, "amountOut"));
//                   const tokenIn = this.extractDetail(details, "from");
//                   const tokenOut = this.extractDetail(details, "to");
//                   const slippage = parseFloat(this.extractDetail(details, "fee")) / 10000;

//                   return {
//                       type: TransactionType.SWAP,
//                       source: TransactionSource.SONIC,
//                       id: poolId,
//                       from: caller,
//                       to: tokenOut,
//                       ts,
//                       raw: rawTx,
//                       tokenIn,
//                       amountIn,
//                       tokenOut,
//                       amountOut,
//                       slippage,
//                   } as SwapTransaction;
//               }

//               case "createPool": {
//                   const token1 = this.extractDetail(details, "token0");
//                   const token2 = this.extractDetail(details, "token1");
//                   const fee = BigInt(this.extractDetail(details, "fee"));

//                   return {
//                       type: TransactionType.CREATE_POOL,
//                       source: TransactionSource.SONIC,
//                       id: this.extractDetail(details, "pool"),
//                       from: caller,
//                       to: caller,
//                       ts,
//                       raw: rawTx,
//                       token1,
//                       token2,
//                       amount1: fee,
//                       amount2: fee, // Placeholder, actual amounts might vary
//                   } as CreatePoolTransaction;
//               }

//               case "mint": {
//                   const token1 = this.extractDetail(details, "token0");
//                   const token2 = this.extractDetail(details, "token1");
//                   const amount1 = BigInt(this.extractDetail(details, "amount0"));
//                   const amount2 = BigInt(this.extractDetail(details, "amount1"));

//                   return {
//                       type: TransactionType.MINT,
//                       source: TransactionSource.SONIC,
//                       id: this.extractDetail(details, "poolId"),
//                       from: caller,
//                       to: this.extractDetail(details, "owner"),
//                       ts,
//                       raw: rawTx,
//                       token1,
//                       token2,
//                       amount1,
//                       amount2,
//                   } as AddLiquidityTransaction;
//               }

//               case "decreaseLiquidity": {
//                   const token1 = this.extractDetail(details, "token0");
//                   const token2 = this.extractDetail(details, "token1");
//                   const amount1 = BigInt(this.extractDetail(details, "amount0"));
//                   const amount2 = BigInt(this.extractDetail(details, "amount1"));

//                   return {
//                       type: TransactionType.DECREASE_LIQUIDITY,
//                       source: TransactionSource.SONIC,
//                       id: this.extractDetail(details, "poolId"),
//                       from: caller,
//                       to: caller,
//                       ts,
//                       raw: rawTx,
//                       token1,
//                       token2,
//                       amount1,
//                       amount2,
//                   } as RemoveLiquidityTransaction;
//               }

//               default:
//                   throw new Error(`Unsupported operation: ${operation}`);
//           }
//       });
//   }

//   private static extractDetail(details: [string, { Text: string }][], key: string): string {
//       const detail = details.find(([k]) => k === key);
//       if (!detail) {
//           throw new Error(`Missing detail: ${key}`);
//       }
//       return detail[1].Text;
//   }
// }
