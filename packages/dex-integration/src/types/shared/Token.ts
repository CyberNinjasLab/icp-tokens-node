/**
 * Represents a token with properties from multiple sources.
 *
 * @typedef {Object} Token
 * @property {string} address - The address of the token.
 * @property {string} [name] - The name of the token (icpswap).
 * @property {string} [symbol] - The symbol of the token (icpswap).
 * @property {string} [chain] - The chain of the token (kongswap).
 * @property {string} [logo] - The logo of the token, can be a URL or Base64 string.
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

    /**
     * The logo of the token.
     *
     * @type {string}
     *
     * @description Can be a URL or a Base64-encoded string representing the token's logo.
     */
    logo?: string;
};
