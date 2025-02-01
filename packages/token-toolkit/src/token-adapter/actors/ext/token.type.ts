import type { Principal } from "@dfinity/principal";
import type { ActorMethod } from "@dfinity/agent";

export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export interface AllowanceRequest {
  owner: User;
  subaccount: [] | [SubAccount];
  spender: Principal;
}
export interface ApproveRequest {
  subaccount: [] | [SubAccount];
  allowance: Balance;
  spender: Principal;
}
export type Balance = bigint;
export interface BalanceRequest {
  token: TokenIdentifier;
  user: User;
}
export type BalanceResponse = { ok: Balance } | { err: CommonError };
export type Balance__1 = bigint;
export type CommonError =
  | { InsufficientBalance: null }
  | { InvalidToken: TokenIdentifier }
  | { Unauthorized: AccountIdentifier }
  | { Other: string };
export type CommonError__1 =
  | { InsufficientBalance: null }
  | { InvalidToken: TokenIdentifier }
  | { Unauthorized: AccountIdentifier }
  | { Other: string };
export type Extension = string;
export interface Holder {
  balance: bigint;
  account: AccountIdentifier;
}
export interface HoldersRequest {
  offset: [] | [bigint];
  limit: [] | [bigint];
}
export type Memo = Uint8Array | number[];
export type Metadata =
  | {
    fungible: {
      decimals: number;
      ownerAccount: AccountIdentifier;
      metadata: [] | [Uint8Array | number[]];
      name: string;
      symbol: string;
    };
  }
  | { nonfungible: { metadata: [] | [Uint8Array | number[]] } };
export interface MintRequest {
  to: User;
  amount: Balance;
}
export interface Page {
  content: Array<Holder>;
  offset: bigint;
  limit: bigint;
  totalElements: bigint;
}
export type Result = { ok: bigint } | { err: CommonError };
export type Result_1 = { ok: Balance__1 } | { err: CommonError__1 };
export type Result_2 = { ok: boolean } | { err: CommonError__1 };
export type Result_3 = { ok: Metadata } | { err: CommonError__1 };
export type Result_4 = { ok: string } | { err: CommonError__1 };
export type Result_5 = { ok: Page } | { err: CommonError };
export type Result_6 = { ok: bigint } | { err: CommonError__1 };
export type SubAccount = Uint8Array | number[];
export type TokenIdentifier = string;
export interface TransferRequest {
  to: User;
  token: TokenIdentifier;
  notify: boolean;
  from: User;
  memo: Memo;
  subaccount: [] | [SubAccount];
  nonce: [] | [bigint];
  amount: Balance;
}
export type TransferResponse =
  | { ok: Balance }
  | {
    err:
    | { InsufficientAllowance: null }
    | { CannotNotify: AccountIdentifier }
    | { InsufficientBalance: null }
    | { InvalidToken: TokenIdentifier }
    | { Rejected: null }
    | { Unauthorized: AccountIdentifier }
    | { Other: string };
  };
export type User = { principal: Principal } | { address: AccountIdentifier };
export type User__1 = { principal: Principal } | { address: AccountIdentifier };
export interface _SERVICE {
  allowance: ActorMethod<[AllowanceRequest], Result_1>;
  approve: ActorMethod<[ApproveRequest], Result_2>;
  balance: ActorMethod<[BalanceRequest], BalanceResponse>;
  cycleAvailable: ActorMethod<[], Result_6>;
  cycleBalance: ActorMethod<[], Result_6>;
  extensions: ActorMethod<[], Array<Extension>>;
  getFee: ActorMethod<[], Result_1>;
  getRootBucketId: ActorMethod<[], string>;
  holders: ActorMethod<[HoldersRequest], Result_5>;
  logo: ActorMethod<[], Result_4>;
  metadata: ActorMethod<[], Result_3>;
  mint: ActorMethod<[MintRequest], TransferResponse>;
  registry: ActorMethod<[], Array<[AccountIdentifier__1, Balance__1]>>;
  setFee: ActorMethod<[Balance__1], Result_2>;
  setFeeTo: ActorMethod<[User__1], Result_2>;
  setLogo: ActorMethod<[string], Result_2>;
  supply: ActorMethod<[], Result_1>;
  totalHolders: ActorMethod<[], Result>;
  transfer: ActorMethod<[TransferRequest], TransferResponse>;
  transferFrom: ActorMethod<[TransferRequest], TransferResponse>;
  txSize: ActorMethod<[], bigint>;
}
