import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type DetailValue = { 'I64' : bigint } |
  { 'U64' : bigint } |
  { 'Vec' : Array<DetailValue> } |
  { 'Slice' : Uint8Array | number[] } |
  { 'TokenIdU64' : bigint } |
  { 'Text' : string } |
  { 'True' : null } |
  { 'False' : null } |
  { 'Float' : number } |
  { 'Principal' : Principal };
export interface Event {
  'time' : bigint,
  'operation' : string,
  'details' : Array<[string, DetailValue]>,
  'caller' : Principal,
}
export interface GetBucketResponse {
  'witness' : [] | [Witness],
  'canister' : Principal,
}
export interface GetNextCanistersResponse {
  'witness' : [] | [Witness],
  'canisters' : Array<Principal>,
}
export interface GetTokenTransactionsArg {
  'token_id' : bigint,
  'page' : [] | [number],
  'witness' : boolean,
}
export type GetTransactionResponse = {
    'Delegate' : [Principal, [] | [Witness]]
  } |
  { 'Found' : [[] | [Event], [] | [Witness]] };
export interface GetTransactionsArg {
  'page' : [] | [number],
  'witness' : boolean,
}
export interface GetTransactionsResponseBorrowed {
  'data' : Array<Event>,
  'page' : number,
  'witness' : [] | [Witness],
}
export interface GetUserTransactionsArg {
  'page' : [] | [number],
  'user' : Principal,
  'witness' : boolean,
}
export interface IndefiniteEvent {
  'operation' : string,
  'details' : Array<[string, DetailValue]>,
  'caller' : Principal,
}
export interface WithIdArg { 'id' : bigint, 'witness' : boolean }
export interface WithWitnessArg { 'witness' : boolean }
export interface Witness {
  'certificate' : Uint8Array | number[],
  'tree' : Uint8Array | number[],
}
export interface _SERVICE {
  'balance' : ActorMethod<[], bigint>,
  'contract_id' : ActorMethod<[], Principal>,
  'get_bucket_for' : ActorMethod<[WithIdArg], GetBucketResponse>,
  'get_next_canisters' : ActorMethod<
    [WithWitnessArg],
    GetNextCanistersResponse
  >,
  'get_stable' : ActorMethod<[bigint, bigint], Uint8Array | number[]>,
  'get_stable_size' : ActorMethod<[], number>,
  'get_token_transactions' : ActorMethod<
    [GetTokenTransactionsArg],
    GetTransactionsResponseBorrowed
  >,
  'get_transaction' : ActorMethod<[WithIdArg], GetTransactionResponse>,
  'get_transactions' : ActorMethod<
    [GetTransactionsArg],
    GetTransactionsResponseBorrowed
  >,
  'get_upgrade_status' : ActorMethod<[], [bigint, boolean]>,
  'get_user_transactions' : ActorMethod<
    [GetUserTransactionsArg],
    GetTransactionsResponseBorrowed
  >,
  'git_commit_hash' : ActorMethod<[], string>,
  'insert' : ActorMethod<[IndefiniteEvent], bigint>,
  'insert_many' : ActorMethod<[Array<IndefiniteEvent>], bigint>,
  'migrate' : ActorMethod<[Array<Event>], undefined>,
  'size' : ActorMethod<[], bigint>,
  'time' : ActorMethod<[], bigint>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];