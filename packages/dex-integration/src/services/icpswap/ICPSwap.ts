import { Actor, Agent } from "@dfinity/agent";
import { GetPoolInput, icswap, IDexWithStorageCanisterTransactions, IPool, ListPoolInput, Transaction } from "../../types";
import { CanisterWrapper } from "../../types/CanisterWrapper";
import { icsNodeIndex, icsBaseIndex, icsBaseStorage } from "../../types/actors";
import { actors } from "../../types";
import { ICPSwapPool } from "./ICPSwapPool";
import { ICPSWAP_BASE_INDEX_CANISTER, ICPSWAP_NODE_INDEX_CANISTER } from "../../config";
import { RecordPage } from "../../types/actors/icpswap/icpswapBaseStorage";
import { BaseStorageActor } from "../../types/ICPSwap";
import { parseICPSwapTransaction } from "../../utils";

type NodeIndexActor = icsNodeIndex._SERVICE;
type BaseIndexActor = icsBaseIndex._SERVICE;

type PublicTokenOverview = actors.icsNodeIndex.PublicTokenOverview;

export class ICPSwap extends CanisterWrapper implements IDexWithStorageCanisterTransactions {
    private nodeIndexActor: NodeIndexActor;
    private baseIndexActor: BaseIndexActor;
    private currentStorageActor: BaseStorageActor | null = null;

    constructor({ agent, nodeIndexAddress, baseIndexAddress }: { agent: Agent; nodeIndexAddress?: string, baseIndexAddress?: string }) {
        const nodeIndexId = nodeIndexAddress ?? ICPSWAP_NODE_INDEX_CANISTER;
        super({ id: nodeIndexId, agent });
        this.nodeIndexActor = Actor.createActor(icsNodeIndex.idlFactory, {
            agent,
            canisterId: nodeIndexId,
        });
        const baseIndexId = baseIndexAddress ?? ICPSWAP_BASE_INDEX_CANISTER;
        this.baseIndexActor = Actor.createActor(icsBaseIndex.idlFactory, {
            agent,
            canisterId: baseIndexId, // BaseIndex canister ID
        });
    }

    async getTransactionsByPool(poolId: string, startOffset: bigint, limit: bigint): Promise<Transaction[]> {
        if (!this.currentStorageActor) {
            throw new Error("No base storage actor is currently set. Please initialize first.");
        }
        
        const result: RecordPage = await this.currentStorageActor.getByPool(startOffset, limit, poolId);
        const transactions: Transaction[] = [];
        const storageCanisterId = this.currentStorageActor.canister_id;

        transactions.push(...result.content
            .map((tx, index) => parseICPSwapTransaction(tx, storageCanisterId, startOffset, index))
            .filter(tx => tx !== null) as Transaction[]);

        return transactions;
    }

    /**
     * Fetches transactions from the current storage canister.
     * 
     * OFFICIAL DOCS: https://github.com/ICPSwap-Labs/docs/blob/main/03.SwapInformation/05.Fetching_Transaction.md
     * 
     * @param startOffset - The offset from which to start fetching transactions.
     * @param limit - The maximum number of transactions to fetch.
     */
    async getStorageCanisterTransactions(startOffset: bigint, limit: bigint): Promise<Transaction[]> {
        if (!this.currentStorageActor) {
            throw new Error("No base storage actor is currently set. Please initialize first.");
        }
        
        const result: RecordPage = await this.currentStorageActor.getTx(startOffset, limit);
        const transactions: Transaction[] = [];
        const storageCanisterId = this.currentStorageActor.canister_id;

        transactions.push(...result.content
            .map((tx, index) => parseICPSwapTransaction(tx, storageCanisterId, startOffset, index))
            .filter(tx => tx !== null) as Transaction[]);

        return transactions;
    }

    async getBaseStorageCanisters(): Promise<string[]> {
        return await this.baseIndexActor.baseStorage();
    }

    /**
     * Initializes or updates the base storage actor with the given agent and address.
     * If no address is provided, it fetches the latest (most recent) canister from baseStorage.
     * @param agent - The agent to use for creating or updating the actor.
     * @param address - Optional address of the canister; if not provided, uses the latest canister.
     */
    async setBaseStorageActor(address?: string) {
        let canisterId = address;
        if (!canisterId) {
            const canisterIds = await this.baseIndexActor.baseStorage();
            if (canisterIds.length > 0) {
                // Assuming the list is sorted from newest to oldest
                canisterId = canisterIds[0]; // Fetch the latest canister
            } else {
                throw new Error("No base storage canisters found.");
            }
        }
        this.currentStorageActor = Actor.createActor(icsBaseStorage.idlFactory, {
            agent: this.agent,
            canisterId
        });
        this.currentStorageActor.canister_id = canisterId;
    }

    async listTokens(): Promise<icswap.Token[]> {
        const tokenData: PublicTokenOverview[] = await this.nodeIndexActor.getAllTokens();
        const tokens: icswap.Token[] = tokenData.map((data) => data);
        return tokens;
    }

    async listPools(token1?: ListPoolInput, token2?: ListPoolInput): Promise<ICPSwapPool[]> {
        let poolData = [];
        if (token2 && !token1) return await this.listPools(token2);
        if (token1) {
            poolData = await this.nodeIndexActor.getPoolsForToken(token1.address);
        } else {
            poolData = await this.nodeIndexActor.getAllPools();
        }

        const pools = poolData.map(
            (poolData) =>
                new ICPSwapPool({
                    poolInfo: poolData,
                    agent: this.agent,
                }),
        );
        if (token2) {
            return pools.filter((pool) => pool.isForToken(token2));
        } else {
            return pools;
        }
    }

    async getPoolByAddress(address: string): Promise<IPool | null> {
        const poolData = (await this.nodeIndexActor.getAllPools()).filter((pool) => pool.pool === address);

        if (poolData.length === 0) return null;

        return new ICPSwapPool({
            agent: this.agent,
            poolInfo: poolData[0],
        });
    }

    async getPool(token1: GetPoolInput, token2: GetPoolInput): Promise<ICPSwapPool | null> {
        const pools = await this.listPools(token1, token2);
        if (pools.length === 0) return null;

        if (pools.length > 1) throw new Error("multiple pools found for this pair");
        return pools[0];
    }

    async getIndexFromTrxId(trxId: string): Promise<bigint> {
        // extracting the index from the transaction ID
        const trxIdParts = trxId.split(".");
        if (trxIdParts.length < 2) {
            throw new Error("Invalid transaction ID format");
        }
        const trxIdNumber = trxIdParts[1];
        const trxIdNumberBigInt = BigInt(trxIdNumber);
        console.log(`Transaction ID number: ${trxIdNumberBigInt}`);
        return trxIdNumberBigInt;
    }

        /**
     * Gets all transactions that are newer than the specified transaction ID.
     * It first locates the transaction with the specified ID, then returns all transactions
     * that came after it (newer ones).
     * 
     * @param trxId - The ID of the transaction to use as the starting point
     * @param startOffset - The offset from which to start fetching transactions
     * @param limit - Maximum number of transactions to fetch in total (safety limit)
     * @returns Array of transactions that are newer than the specified transaction ID
     */
    async getTrxsAfterTrxId(trxId: string, limit: number = 1000): Promise<Transaction[]> {
        if (!trxId) {
        throw new Error("Transaction ID is required");
        }
        
        const trxIndex = await this.getIndexFromTrxId(trxId);

        const newerTransactions: Transaction[] = [];
        let currentOffset = trxIndex;
        let batchSize = 1000n;
        
        try {
            while (newerTransactions.length < limit) {
                const transactions = await this.getStorageCanisterTransactions(currentOffset, batchSize);
                if (transactions.length === 0) {
                    console.log(`No more transactions found`);
                    break;
                }
                const remainingCapacity = limit - newerTransactions.length;
                if (remainingCapacity > 0) {
                    newerTransactions.push(...transactions.slice(0, remainingCapacity));
                }
                currentOffset += batchSize;
            }
            return newerTransactions;
            
        } catch (error) {
        console.error(`Error fetching transactions after ${trxId}:`, error);
        throw new Error(`Error fetching transactions after ${trxId}: ${error}`);
        }
    }
}
