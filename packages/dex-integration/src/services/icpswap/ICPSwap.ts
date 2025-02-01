import { Actor, Agent } from "@dfinity/agent";
import { AddLiquidityTransaction, GetPoolInput, icswap, IDexWithPoolTransactions, IPool, ListPoolInput, RemoveLiquidityTransaction, SwapTransaction, Transaction, TransactionInfo, TransactionSource, TransactionType } from "../../types";
import { CanisterWrapper } from "../../types/CanisterWrapper";
import { icsNodeIndex, icsBaseIndex, icsBaseStorage } from "../../types/actors";
import { actors } from "../../types";
import { ICPSwapPool } from "./ICPSwapPool";
import { ICPSWAP_BASE_INDEX_CANISTER, ICPSWAP_NODE_INDEX_CANISTER } from "../../config";
import { RecordPage } from "../../types/actors/icpswap/icpswapBaseStorage";
import { BaseStorageActor } from "../../types/ICPSwap";

type NodeIndexActor = icsNodeIndex._SERVICE;
type BaseIndexActor = icsBaseIndex._SERVICE;

type PublicTokenOverview = actors.icsNodeIndex.PublicTokenOverview;

export class ICPSwap extends CanisterWrapper implements IDexWithPoolTransactions {
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

    /**
     * Fetches transactions for a specific pool using the currently set base storage actor, 
     * with the option to start fetching from a given offset.
     * This method will throw an error if no base storage actor is currently set.
     * 
     * OFFICIAL DOCS: https://github.com/ICPSwap-Labs/docs/blob/main/03.SwapInformation/05.Fetching_Transaction.md
     *
     * @param poolId - The identifier of the pool for which to fetch transactions.
     * @param startOffset - The offset from which to start fetching transactions. Defaults to 0.
     * @returns A promise that resolves to an array of transactions for the specified pool, 
     *          starting from the given offset.
     * @throws Error if no current storage actor is set or if there's an issue fetching transactions.
     */
    async getTransactionsByPool(poolId: string, startOffset: bigint = 0n, limit: bigint = 100n): Promise<Transaction[]> {
        if (!this.currentStorageActor) {
            throw new Error("No base storage actor is currently set. Please initialize first.");
        }
    
        // const allTransactions: Transaction[] = []; // TODO: Converter
        const transactions: Transaction[] = [];
        let offset = startOffset;
    
        while (true) {
            const page: RecordPage = await this.currentStorageActor.getByPool(offset, limit, poolId);
            if (!page.content || page.content.length === 0) break;

            const storageCanisterId = this.currentStorageActor.canister_id;

            transactions.push(...page.content.map((tx, index) => {
                const baseInfo: TransactionInfo = {
                    from: tx.from,
                    to: tx.to,
                    ts: tx.timestamp,
                    id: `${storageCanisterId}.${poolId}.${offset + BigInt(index)}`,
                    source: TransactionSource.ICPSWAP,
                    raw: tx as unknown as icswap.Transaction, // Type assertion since the raw types might differ
                    type: TransactionType.SWAP // Default type if no match
                };
    
                if ('swap' in tx.action) {
                    return {
                        ...baseInfo,
                        type: TransactionType.SWAP,
                        tokenIn: tx.token0Symbol,
                        amountIn: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))), // Convert to bigint
                        tokenOut: tx.token1Symbol,
                        amountOut: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals))), // Convert to bigint
                        slippage: 0 // No slippage info provided; you might want to calculate or set this based on your logic
                    } as SwapTransaction;
                } else if ('addLiquidity' in tx.action || 'increaseLiquidity' in tx.action) {
                    return {
                        ...baseInfo,
                        type: TransactionType.ADD_LIQUIDITY,
                        token1: tx.token0Symbol,
                        token2: tx.token1Symbol,
                        amount1: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))), // Convert to bigint
                        amount2: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals)))  // Convert to bigint
                    } as AddLiquidityTransaction;
                } else if ('decreaseLiquidity' in tx.action) {
                    return {
                        ...baseInfo,
                        type: TransactionType.DECREASE_LIQUIDITY,
                        token1: tx.token0Symbol,
                        token2: tx.token1Symbol,
                        amount1: BigInt(Math.round(tx.amountToken0 * Math.pow(10, tx.token0Decimals))), // Convert to bigint
                        amount2: BigInt(Math.round(tx.amountToken1 * Math.pow(10, tx.token1Decimals)))  // Convert to bigint
                    } as RemoveLiquidityTransaction;
                } else {
                    // If no specific type matches, we'll treat it as an error or unknown type
                    // console.warn('Unknown transaction type:', tx.action);
                    return null; // Filter out in the next step
                }
            }).filter(tx => tx !== null) as Transaction[]);
    
            if (page.content.length < Number(limit) || offset + BigInt(page.content.length) >= page.totalElements) break;
            offset = page.offset + BigInt(page.content.length); // Update offset with the next starting point
        }
    
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
}
