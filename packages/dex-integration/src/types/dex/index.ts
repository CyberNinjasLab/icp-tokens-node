import { IPool } from "../pool";
import { GetPoolInput, ListPoolInput, Token, Transaction } from "../shared";

export interface IDex {
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
     *
     */
    getPoolByAddress(address: string): Promise<IPool | null>;
    getTransactions(): Promise<Transaction[]>;
}
