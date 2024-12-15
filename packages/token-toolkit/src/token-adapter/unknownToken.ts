import { ic } from "ic0";
import { IToken } from "./types/IToken";

export class UnknownToken implements IToken {
  public readonly ic: any;
  public readonly actor = undefined;

  constructor({
    canisterId
  }: {
    canisterId: string;
  }) {
    this.ic = ic(canisterId);
  }

  balanceOf(): undefined {
    return undefined;
  }

  async getDecimals(): Promise<number> {
    return await this.ic.call("decimals");
  }
  async name(): Promise<string> {
    return await this.ic.call("name");
  }
  async symbol(): Promise<string> {
    return await this.ic.call("symbol");
  }
  async totalSupply(): Promise<number> {
    return this.ic.call("totalSupply");
  }
  async getFee(): Promise<bigint> {
    return await this.ic.call("getTokenFee");
  }
  async getMetadata(): Promise<object> {
    return await this.ic.call("getMetadata");
  }
  async getLogo(): Promise<string> {
    return await this.ic.call("logo");
  }
}
