import { Agent } from "@dfinity/agent";

export type CanisterWrapperInitArgs = { id: string; agent: Agent };

export class CanisterWrapper {
    protected id: string;
    protected agent: Agent;

    constructor({ id, agent }: CanisterWrapperInitArgs) {
        this.id = id;
        this.agent = agent;
    }

    public getCanisterId(): string {
        return this.id;
    }

    public getAgent(): Agent {
        return this.agent;
    }
}
