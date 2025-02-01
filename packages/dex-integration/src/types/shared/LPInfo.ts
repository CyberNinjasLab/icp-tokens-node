/**
 * Represents the information about a liquidity pool (LP).
 *
 * @typedef {Object} LPInfo
 * @property {string} token1Address - The address of the first token in the liquidity pool.
 * @property {string} token2Address - The address of the second token in the liquidity pool.
 * @property {string} token1Symbol - The symbol of the first token in the liquidity pool.
 * @property {string} token2Symbol - The symbol of the second token in the liquidity pool.
 * @property {number} token1Balance - The balance of the first token in the liquidity pool.
 * @property {number} token2Balance - The balance of the second token in the liquidity pool.
 * @property {number} lpFeeToken1 - The liquidity pool fee for the first token.
 * @property {number} lpFeeToken2 - The liquidity pool fee for the second token.
 * @property {number} lpFee - The fee of the liquidity pool.
 * @property {number} price - The price of the liquidity pool.
 */
export type LPInfo = {
    /**
     * The address of the first token in the liquidity pool.
     *
     * @type {string}
     *
     * @source icpswap - Corresponds to PublicPoolOverView `token0Id`
     * @source kongswap - Corresponds to PoolReply `address_0`
     */
    token1Address: string;

    /**
     * The address of the second token in the liquidity pool.
     *
     * @type {string}
     *
     * @source icpswap - Corresponds to PublicPoolOverView `token1Id`
     * @source kongswap - Corresponds to PoolReply `address_1`
     */
    token2Address: string;

    /**
     * The chain of the first token in the liquidity pool.
     *
     * @type {string}
     *
     * @source kongswap - Corresponds to PoolReply `chain_0`
     */
    token1Chain?: string;

    /**
     * The chain of the second token in the liquidity pool.
     *
     * @type {string}
     *
     * @source kongswap - Corresponds to PoolReply `chain_1`
     */
    token2Chain?: string;
    /**
     * The symbol of the first token in the liquidity pool.
     *
     * @type {string}
     *
     * @source icpswap - Corresponds to PublicPoolOverView `token0Symbol`
     * @source kongswap - Corresponds to PoolReply `symbol_0`
     */
    token1Symbol: string;

    /**
     * The symbol of the second token in the liquidity pool.
     *
     * @type {string}
     *
     * @source icpswap - Corresponds to PublicPoolOverView `token1Symbol`
     * @source kongswap - Corresponds to PoolReply `symbol_1`
     */
    token2Symbol: string;

    /**
     * The balance of the first token in the liquidity pool.
     *
     * @type {bigint}
     *
     * @source icpswap - Corresponds to `token0Amount`
     * @source kongswap - Corresponds to `balance_0`
     */
    token1Balance: bigint;

    /**
     * The balance of the second token in the liquidity pool.
     *
     * @type {bigint}
     *
     * @source icpswap - Corresponds to `token1Amount`
     * @source kongswap - Corresponds to `balance_1`
     */
    token2Balance: bigint;

    /**
     * The liquidity pool fee for the first token.
     *
     * @type {bigint}
     *
     * @source icpswap - Corresponds to `swapFee0Repurchase`
     * @source kongswap - Corresponds to `lp_fee_0`
     */
    lpFeeToken1: bigint;

    /**
     * The liquidity pool fee for the second token.
     *
     * @type {bigint}
     *
     * @source icpswap - Corresponds to `swapFee1Repurchase`
     * @source kongswap - Corresponds to `lp_fee_1`
     */
    lpFeeToken2: bigint;

    /**
     * The fee of the liquidity pool.
     *
     * @type {number}
     *
     * @source icpswap - Corresponds to PublicPoolOverView `feeTier` (e.g., 300 is 0.3%)
     * @source kongswap - Corresponds to PoolReply `lp_fee_bps` (e.g., 30 is 0.3%)
     */
    lpFee: number;

    /**
     * The price of the liquidity pool.
     * @type {number}
     *
     * @source icpswap - Corresponds to PublicPoolOverView `sqrtPrice`
     * @source kongswap - Corresponds to PoolReply `price`
     */
    price: number;
};
