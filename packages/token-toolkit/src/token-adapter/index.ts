import { Principal } from "@dfinity/principal";
import { IToken } from "./types/IToken";
import { HttpAgent } from "@dfinity/agent";
import ic from 'ic0';
import { ICRC1Token } from "./icrc1";
import { UnknownToken } from "./unknownToken";

export type TokenStandard = "DIP20" | "ICRC";

export class Token {
  private tokenCanisterId: string;
  private tokenCanister;
  private agent: HttpAgent;
  private token: IToken | null = null;
  private isInitialized: boolean = false;

  constructor(
      {
          canisterId,
          agent
      }: {
          canisterId: string;
          agent: HttpAgent;
      }
  ) {
    this.agent = agent;
    this.tokenCanisterId = canisterId;
    this.tokenCanister = ic(canisterId);
  }

  public async init(): Promise<void> {
    try {
        let standard = undefined;

        try {
            // Call the canister method to check supported standards
            const result: Array<{ url: string; name: string }> = await this.tokenCanister.call("icrc1_supported_standards");
        
            // Determine the standard using the helper function
            standard = this.determineTokenStandard(result);

        } catch (error) {
          if (
              !(error instanceof TypeError &&
              error.message === "actor[method] is not a function")
          ) {
            throw error;
          }
        }

        switch(standard) {
            case "ICRC":
                this.token = new ICRC1Token({
                    canisterId: this.tokenCanisterId,
                    agent: this.agent,
                });
                break;
            default:
                this.token = new UnknownToken({
                  canisterId: this.tokenCanisterId
                });
        }

        this.isInitialized = true;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(`Unknown error: ${error}`);
        }
    }
  }

  private determineTokenStandard(supportedStandards: Array<{ url: string; name: string }>): TokenStandard | null {
        const standardNames = supportedStandards.map(standard => standard.name);
        const allStandards = new Set(standardNames);

        if (allStandards.has('DIP20')) {
            return 'DIP20';
        } else if (allStandards.has('DRC20')) {
            // Assuming 'DRC20' maps to 'DIP20' in TokenStandard
            return 'DIP20';
        }

        if (allStandards.has('ICRC-1')) {
            return 'ICRC';
        }

        return null;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
        throw new Error("Token not initialized. Please call init() before using this method.");
    }
  }

  public async getDecimals(): Promise<number|undefined> {
    this.ensureInitialized();
    return this.token?.getDecimals();
  }

  public async balanceOf(address: string | { owner: Principal; subaccount: [] | [Uint8Array | number[]]; }): Promise<number|undefined> {
    this.ensureInitialized();
    return this.token?.balanceOf(address);
  }

  public async name(): Promise<string|undefined> {
    this.ensureInitialized();
    return this.token?.name();
  }

  public async symbol(): Promise<string|undefined> {
    this.ensureInitialized();
    return this.token?.symbol();
  }

  public async totalSupply(): Promise<number|undefined> {
    this.ensureInitialized();
    return this.token?.totalSupply();
  }

  public async getFee(): Promise<bigint|undefined> {
    this.ensureInitialized();
    return this.token?.getFee();
  }

  public async getMetadata(): Promise<any|undefined> {
    this.ensureInitialized();
    return this.token?.getMetadata();
  }

  public async getLogo(): Promise<string|undefined> {
    this.ensureInitialized();
    return this.token?.getLogo();
  }
}