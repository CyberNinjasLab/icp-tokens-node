import { Actor, Agent } from "@dfinity/agent";
import { GetPoolInput, IDex, IDexWithGlobalTransactions, IPool, ListPoolInput, Token, Transaction, TransactionInfo, TransactionSource, TransactionType } from "../../types";
import { CanisterWrapper } from "../../types/CanisterWrapper";
import { SONIC_SWAP_CAP_ROOT_CANISTER, SONIC_SWAP_TOKEN_REGISTRY } from "../../config";
import { sonicSwapCapRoot } from "../../types/actors";
import axios from 'axios';

type SonicSwapCapRootActor = sonicSwapCapRoot._SERVICE;

export class Sonic extends CanisterWrapper implements IDexWithGlobalTransactions {
    private sonicSwapCapRootActor : SonicSwapCapRootActor;

    constructor({ agent, swapCapRootCanisterAddress }: { agent: Agent; swapCapRootCanisterAddress?: string }) {
        const swapCapRootCanisterId = swapCapRootCanisterAddress ?? SONIC_SWAP_CAP_ROOT_CANISTER;
        super({ id: swapCapRootCanisterId, agent });
        this.sonicSwapCapRootActor = Actor.createActor(sonicSwapCapRoot.idlFactory, {
            agent,
            canisterId: swapCapRootCanisterId,
        });
    }

    async getAllTransactions(page: number): Promise<Transaction[]> {
        throw new Error("Method not implemented.");

        const txsResult = await this.sonicSwapCapRootActor.get_transactions({
            page: [page],
            witness: false
        });
    
        if (!txsResult || !txsResult.data) {
            throw new Error("Failed to fetch transactions or invalid response structure");
        }
    
        // return txsResult.data.map((tx: any) => this.parseTransaction(tx));
    }
    
    private parseTransaction(tx: any): TransactionInfo {
        const transactionType = this.mapOperationToTransactionType(tx.operation);
        const source = TransactionSource.SONIC; // Since we're dealing with Sonic
    
        // Extract details from the transaction JSON
        const details = Object.fromEntries(tx.details.map(([key, value]: [string, any]) => [key, value.Text]));
    
        return {
            type: transactionType,
            source,
            id: details.poolId || details.key || "unknown", // Use `poolId` or `key` as ID where possible
            from: tx.caller || details.from || "unknown",
            to: details.to || "unknown",
            ts: BigInt(tx.time),
            raw: tx // Store the raw transaction for debugging or future reference
        };
    }
    
    private mapOperationToTransactionType(operation: string): TransactionType {
        switch (operation) {
            case "swap":
                return TransactionType.SWAP;
            case "createPool":
                return TransactionType.CREATE_POOL;
            case "mint":
                return TransactionType.MINT;
            case "collect":
                return TransactionType.CLAIM;
            case "decreaseLiquidity":
                return TransactionType.DECREASE_LIQUIDITY;
            case "increaseLiquidity":
                return TransactionType.ADD_LIQUIDITY;
            default:
                throw new Error(`Unknown transaction operation: ${operation}`);
        }
    }
    
    async listTokens(): Promise<Token[]> {
        return Sonic.fetchTokens();
    }
    listPools(token1?: ListPoolInput, token2?: ListPoolInput): Promise<IPool[]> {
        throw new Error("Method not implemented.");
    }
    getPool(token1: GetPoolInput, token2: GetPoolInput): Promise<IPool | null> {
        throw new Error("Method not implemented.");
    }
    getPoolByAddress(address: string): Promise<IPool | null> {
        throw new Error("Method not implemented.");
    }
    static async fetchTokens(): Promise<Token[]> {
        try {
            const response = await axios.get(SONIC_SWAP_TOKEN_REGISTRY);
            return response.data.map((token: any) => ({
                id: token.id,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
                totalSupply: token.totalSupply,
                address: token.address,
                logo: token.logo,
            }));
        } catch (error) {
            console.error("Error fetching tokens:", error);
            throw new Error("Failed to fetch tokens.");
        }
    }
}
