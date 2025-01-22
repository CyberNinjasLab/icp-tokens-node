import { Actor, Agent, HttpAgent } from "@dfinity/agent";
import * as bobFunBaseActor from "../types/bobFunBaseActor";
import { BOB_FUN_BASE_ACTOR_ID } from "../config";

export type OrderBy = bobFunBaseActor.OrderBy;

export class BobFunBaseService {
  private agent: Agent;
  public actor: bobFunBaseActor._SERVICE;

  constructor(host: string = "https://ic0.app") {
    this.agent = new HttpAgent({ host });
    this.actor = this.createBobActor();
  }

  private createBobActor(): bobFunBaseActor._SERVICE {
    return Actor.createActor(bobFunBaseActor.idlFactory, {
      agent: this.agent,
      canisterId: BOB_FUN_BASE_ACTOR_ID,
    });
  }

  public async getTokens(orderBy: OrderBy, limit: bigint = 16n): Promise<void> {
    // Example method, replace with actual functionality
    const result = await this.actor.get_tokens(orderBy, limit);
    console.log(result);
  }
}