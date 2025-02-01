import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'status_code' : number,
}
export type NatResult = { 'ok' : bigint } |
  { 'err' : string };
export interface PublicPoolOverView {
  'id' : bigint,
  'token0TotalVolume' : number,
  'volumeUSD1d' : number,
  'volumeUSD7d' : number,
  'token0Id' : string,
  'token1Id' : string,
  'token1Volume24H' : number,
  'totalVolumeUSD' : number,
  'sqrtPrice' : number,
  'pool' : string,
  'tick' : bigint,
  'liquidity' : bigint,
  'token1Price' : number,
  'feeTier' : bigint,
  'token1TotalVolume' : number,
  'volumeUSD' : number,
  'feesUSD' : number,
  'token0Volume24H' : number,
  'token1Standard' : string,
  'txCount' : bigint,
  'token1Decimals' : number,
  'token0Standard' : string,
  'token0Symbol' : string,
  'token0Decimals' : number,
  'token0Price' : number,
  'token1Symbol' : string,
}
export interface RecordPage {
  'content' : Array<Transaction>,
  'offset' : bigint,
  'limit' : bigint,
  'totalElements' : bigint,
}
export interface Transaction {
  'to' : string,
  'action' : TransactionType,
  'token0Id' : string,
  'token1Id' : string,
  'liquidityTotal' : bigint,
  'from' : string,
  'hash' : string,
  'tick' : bigint,
  'token1Price' : number,
  'recipient' : string,
  'token0ChangeAmount' : number,
  'sender' : string,
  'liquidityChange' : bigint,
  'token1Standard' : string,
  'token0Fee' : number,
  'token1Fee' : number,
  'timestamp' : bigint,
  'token1ChangeAmount' : number,
  'token1Decimals' : number,
  'token0Standard' : string,
  'amountUSD' : number,
  'amountToken0' : number,
  'amountToken1' : number,
  'poolFee' : bigint,
  'token0Symbol' : string,
  'token0Decimals' : number,
  'token0Price' : number,
  'token1Symbol' : string,
  'poolId' : string,
}
export type TransactionType = { 'decreaseLiquidity' : null } |
  { 'claim' : null } |
  { 'swap' : null } |
  { 'addLiquidity' : null } |
  { 'increaseLiquidity' : null };
export interface _SERVICE {
  'addOwners' : ActorMethod<[Array<Principal>], undefined>,
  'batchInsert' : ActorMethod<[Array<Transaction>], undefined>,
  'cycleAvailable' : ActorMethod<[], NatResult>,
  'cycleBalance' : ActorMethod<[], NatResult>,
  'getBaseRecord' : ActorMethod<[bigint, bigint, Array<string>], RecordPage>,
  'getByPool' : ActorMethod<[bigint, bigint, string], RecordPage>,
  'getByToken' : ActorMethod<[bigint, bigint, string], RecordPage>,
  'getOwners' : ActorMethod<[], Array<Principal>>,
  'getPools' : ActorMethod<[], Array<[string, PublicPoolOverView]>>,
  'getTx' : ActorMethod<[bigint, bigint], RecordPage>,
  'getTxCount' : ActorMethod<[], bigint>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'insert' : ActorMethod<[Transaction], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];