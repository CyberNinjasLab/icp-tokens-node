import { Principal } from "@dfinity/principal";
import { TokenActor } from "./TokenStandardActor";

export interface IToken {
  actor: TokenActor | undefined;
  getDecimals(): Promise<number>;
  balanceOf(
    address:
      | string
      | {
        owner: Principal;
        subaccount: [] | [Uint8Array | number[]];
      }
  ): Promise<number> | undefined;
  name(): Promise<string>;
  symbol(): Promise<string>;
  totalSupply(): Promise<number>;
  getFee(): Promise<bigint>;
  getMetadata(): Promise<any>;
  getLogo(): Promise<string>;
}
