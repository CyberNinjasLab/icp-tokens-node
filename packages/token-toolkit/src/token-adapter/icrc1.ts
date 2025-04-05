import { Principal } from "@dfinity/principal";
import { IToken } from "./types/IToken";
import { ICRC1Actor } from "./types/TokenStandardActor";
import { MetadataValue } from "./actors/icrc1";
import { HttpAgent } from "@dfinity/agent";
import { ICRC1 } from "./actors";

export class ICRC1Token implements IToken {
  public readonly actor: ICRC1Actor;
  public readonly decimals: number = 1e8;

  constructor({
    canisterId,
    agent,
  }: {
    canisterId: string;
    agent: HttpAgent;
  }) {
    this.actor = ICRC1.createActor({
      agent,
      canisterId,
    });
  }

  async getDecimals(): Promise<number> {
    return await this.actor.icrc1_decimals();
  }
  async balanceOf(
    address:
      | string
      | {
        owner: Principal;
        subaccount: [Uint8Array | number[]] | [];
      }
  ): Promise<number> {
    let balance;
    if (typeof address === "string") {
      balance = await this.actor.icrc1_balance_of({
        owner: Principal.fromText(address),
        subaccount: [],
      });
    } else {
      balance = await this.actor.icrc1_balance_of({
        owner: address.owner,
        subaccount: address.subaccount,
      });
    }
    return Number(balance) / this.decimals;
  }
  async name(): Promise<string> {
    return await this.actor.icrc1_name();
  }
  async symbol(): Promise<string> {
    return await this.actor.icrc1_symbol();
  }
  async totalSupply(): Promise<bigint> {
    return await this.actor.icrc1_total_supply();
  }
  async getFee(): Promise<bigint> {
    return await this.actor.icrc1_fee();
  }
  async getBurnedAmountInDeadWallet(): Promise<number> {
    const burnedAmount = await this.balanceOf("aaaaa-aa");
    return Number(burnedAmount);
  }
  async getBurnedAmmount(): Promise<number> {
    const burnedDeadWallet = await this.getBurnedAmountInDeadWallet();
    return burnedDeadWallet;
  }

  async getMetadata(): Promise<Array<[string, MetadataValue]>> {
    return await this.actor.icrc1_metadata();
  }

  async getLogo(): Promise<string> {
    const metadata = await this.getMetadata();
    for (const meta of metadata) {
      if (meta[0] === "icrc1:logo" && "Text" in meta[1] && meta[1].Text) {
        return meta[1].Text;
      }
    }
    return "";
  }
}
