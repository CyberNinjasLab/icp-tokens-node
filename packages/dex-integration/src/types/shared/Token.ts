/**
 * Represents a token with properties from multiple sources.
 *
 * @typedef {Object} Token
 * @property {string} address - The address of the token.
 * @property {string} [name] - The name of the token (icpswap).
 * @property {string} [symbol] - The symbol of the token (icpswap).
 * @property {string} [chain] - The chain of the token (kongswap).
 */
export type Token = {
    /**
     * The address of the token.
     * @type {string}
     */
    address: string;

    /**
     * The name of the token.
     *
     * @type {string}
     *
     * @source icpswap - Corresponds to the token's name.
     */
    name?: string;

    /**
     * The symbol of the token.
     *
     * @type {string}
     *
     * @source icpswap - Corresponds to the token's symbol.
     */
    symbol?: string;

    /**
     * The chain of the token.
     *
     * @type {string}
     *
     * @source kongswap - Corresponds to the token's chain.
     */
    chain?: string;
};
