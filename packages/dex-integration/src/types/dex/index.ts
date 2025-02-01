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

export interface IDexWithPoolTransactions extends IDexBase {
    /**
     * Fetches transactions for a specific pool. 
     * 
     * @param poolId - The identifier of the pool for which to fetch transactions.
     * @param startOffset - The starting offset for pagination.
     * @param limit - The maximum number of transactions to fetch.
     * @returns A promise that resolves to an array of transactions for the specified pool.
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
 * - `getTransactionsByPool`
 * - `getAllTransactions`
 */
export type IDex = IDexWithPoolTransactions | IDexWithGlobalTransactions;
