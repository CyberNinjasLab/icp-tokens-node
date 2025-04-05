import { IPool } from "../pool";
import { GetPoolInput, ListPoolInput, Token, Transaction } from "../shared";

export interface IDexBase {
    listTokens(): Promise<Token[]>;
    listPools(token1?: ListPoolInput, token2?: ListPoolInput): Promise<IPool[]>;
    getPool(token1: GetPoolInput, token2: GetPoolInput): Promise<IPool | null>;
    /**
     * Gets the pool by its address.
     *
     * @param {string} address - The address of the pool.
     *
     * @example kongswap
     * const pool = await dex.getPoolByAddress('IC.miasr-qaaaa-aaaam-admma-cai_IC.zdzgz-siaaa-aaaar-qaiba-cai');
     *
     * @example icpswap
     * const pool = await dex.getPoolByAddress('icpswap-xyz123');
     *
     * @returns {Promise<IPool | null>} A promise that resolves to the pool if found, or null if not found.
     */
    getPoolByAddress(address: string): Promise<IPool | null>;
}

export interface IDexWithStorageCanisterTransactions extends IDexBase {
    /**
     * 
     * @param startOffset
     * @param limit 
     */
    getStorageCanisterTransactions(startOffset: bigint, limit: bigint): Promise<Transaction[]>;

    /**
     * Fetches transactions by pool ID.
     * 
     * @param poolId - The ID of the pool.
     * @param startOffset 
     * @param limit 
     */
    getTransactionsByPool(poolId: string, startOffset: bigint, limit: bigint): Promise<Transaction[]>;
}

export interface IDexWithGlobalTransactions extends IDexBase {
    /**
     * Fetches transactions globally for the DEX. 
     * 
     * - For DEXes supporting pagination (e.g., Sonic), transactions are fetched in pages, with 64 transactions per page.
     * - For DEXes supporting filters (e.g., KongSwap), transactions can be filtered by `tokenId`, `userPID`, or `txID`.
     */
    getAllTransactions(page: number): Promise<Transaction[]>;
    getAllTransactions(tokenId?: number, userPID?: string, txID?: bigint): Promise<Transaction[]>;
}

/**
 * The main IDex type ensures that a class must implement at least one of:
 * - `getStorageCanisterTransactions`
 * - `getTransactionsByPool`
 * - `getAllTransactions`
 */
export type IDex = IDexWithStorageCanisterTransactions | IDexWithGlobalTransactions;
