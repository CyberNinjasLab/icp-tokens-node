import { Actor, Agent } from "@dfinity/agent";
import {
    GetLPInfoResponse,
    IPool,
    kongswap,
    LedgerTransactionType,
    LedgerTx,
    PoolData,
    PrepareSwapInput,
    PrepareSwapResponse,
    QuoteInput,
    QuoteResponse,
    SwapInput,
    SwapResponse,
    Token,
} from "../../types";
import { kongBase } from "../../types/actors";
import { CanisterWrapper } from "../../types/CanisterWrapper";
import { parseResultResponse, validateCaller } from "../../utils";
import { PoolInfo } from "../../types/KongSwap";
import { SwapAmountsReply, TxId } from "../../types/actors/kongswap/kongBase";
import { Token as TokenAdapter, TokenStandard } from "@alpaca-icp/token-adapter";
import { Principal } from "@dfinity/principal";

type KongSwapActor = kongBase._SERVICE;

/**
 * KongSwap is a class that interacts with the KongSwap backend canister.
 *
 * @param agent
 * The HttpAgent used to interact with the backend canister.
 * @param address (optional)
 * The canister address of the backend canister.
 * @param poolData - The pool data of the pool.
 * Token of the pool must be provided with `chain` property.
 * @returns An instance of KongSwap.
 *
 */
export class KongSwapPool extends CanisterWrapper implements IPool {
    private actor: KongSwapActor;
    private poolInfo: PoolInfo;
    constructor({
        agent,
        address,
        poolInfo,
    }: {
        agent: Agent;
        address: string;
        poolInfo: PoolInfo;
    }) {
        const id = address;
        super({ id, agent });

        this.actor = Actor.createActor(kongBase.idlFactory, {
            agent,
            canisterId: id,
        });
        this.poolInfo = poolInfo;
    }
    
    getPoolInfo(): kongswap.PoolInfo {
        return this.poolInfo;
    }

    private toSwapArgs(args: SwapInput): kongswap.SwapInput {
        const [token1, token2] = this.getTokens();

        if (!this.isForToken(args.tokenIn)) {
            throw new Error("Invalid token");
        }

        const tokenIn = args.tokenIn.address === token1.address ? token1 : token2;
        const tokenOut = args.tokenIn.address === token1.address ? token2 : token1;

        const tokenInWithChain = `${tokenIn.chain}.${tokenIn.address}`;
        const tokenOutWithChain = `${tokenOut.chain}.${tokenOut.address}`;

        return {
            tokenIn: tokenInWithChain,
            amountIn: args.amountIn,
            tokenOut: tokenOutWithChain,
            amountOut: args.amountOut,
            slippage: args.slippage,
        };
    }

    async prepareSwap(args: PrepareSwapInput): Promise<PrepareSwapResponse> {
        const caller = await this.agent.getPrincipal();
        validateCaller(caller);

        const tokenSwapInstance = new TokenAdapter({
            canisterId: args.tokenIn.address,
            tokenStandard: "ICRC1" as TokenStandard,
            agent: this.agent,
        });

        // This is hack to know what token standard is supported by the token
        const tokenStandards = await tokenSwapInstance.supportedStandards();

        const response: Array<LedgerTx> = [];

        if (!tokenStandards.includes("ICRC-1") && !tokenStandards.includes("ICRC-2")) {
            throw new Error("Token standard not supported");
        }

        const isOnlyICRC1 = !tokenStandards.includes("ICRC-2") && tokenStandards.includes("ICRC-1");

        if (isOnlyICRC1) {
            const transferBlockId = await tokenSwapInstance.transfer({
                fee: [],
                memo: [],
                from_subaccount: [],
                created_at_time: [],
                amount: args.amountIn,
                to: {
                    owner: Principal.fromText(this.id),
                    subaccount: [],
                },
            });

            response.push({
                address: args.tokenIn.address,
                blockId: transferBlockId,
                amount: args.amountIn,
                timestamp: Date.now(),
                type: LedgerTransactionType.Transfer,
                from: {
                    owner: caller,
                    subaccount: [],
                },
                to: {
                    owner: Principal.fromText(this.id),
                    subaccount: [],
                },
            });
        } else {
            const approveBlockId = await tokenSwapInstance.approve({
                fee: [],
                memo: [],
                from_subaccount: [],
                created_at_time: [],
                amount: args.approveAmount,
                expected_allowance: [],
                expires_at: [],
                spender: {
                    owner: Principal.fromText(this.id),
                    subaccount: [],
                },
            });

            response.push({
                address: args.tokenIn.address,
                blockId: approveBlockId,
                amount: args.amountIn,
                timestamp: Date.now(),
                type: LedgerTransactionType.Approve,
                from: {
                    owner: caller,
                    subaccount: [],
                },
                spender: {
                    owner: Principal.fromText(this.id),
                    subaccount: [],
                },
            });
        }
        return response;
    }

    /**
     * @description this swap method only supportts for icrc2 tokens
     */
    async swap(args: SwapInput): Promise<SwapResponse> {
        const caller = await this.agent.getPrincipal();
        validateCaller(caller);
        const kongswapArgs = this.toSwapArgs(args);

        let pay_tx_id: TxId | null = null;

        // checking only one ledger transaction is allowed
        // checking the ledger transaction type is transfer
        if (args.ledgerTxs) {
            if (args.ledgerTxs.length >= 2) {
                throw new Error(
                    "Invalid ledger transactions. KongSwap need only one ledger transaction",
                );
            }

            const ledgerTx = args.ledgerTxs[0];

            if (ledgerTx.type === LedgerTransactionType.Transfer) {
                pay_tx_id = {
                    BlockIndex: ledgerTx.blockId,
                };
            }
        }

        const swapResult = await this.actor.swap({
            pay_token: kongswapArgs.tokenIn,
            pay_amount: kongswapArgs.amountIn,
            receive_token: kongswapArgs.tokenOut,
            receive_amount: [kongswapArgs.amountOut],
            max_slippage: [args.slippage],
            referred_by: [],
            receive_address: [],
            pay_tx_id: pay_tx_id ? [pay_tx_id] : [],
        });
        const res = parseResultResponse(swapResult);

        if (res.status !== "Success") {
            throw new Error("Swap failed " + res);
        }

        return res.receive_amount;
    }

    async getMaxSlippage(args: QuoteInput): Promise<number> {
        const [token1, token2] = this.getTokens();

        if (!this.isForToken(args.tokenIn)) {
            throw new Error("Invalid token");
        }

        const tokenIn = args.tokenIn.address === token1.address ? token1 : token2;
        const tokenOut = args.tokenIn.address === token1.address ? token2 : token1;

        const tokenInWithChain = `${tokenIn.chain}.${tokenIn.address}`;
        const tokenOutWithChain = `${tokenOut.chain}.${tokenOut.address}`;

        const swapAmountResult = await this.actor.swap_amounts(
            tokenInWithChain,
            args.amountIn,
            tokenOutWithChain,
        );
        const res = parseResultResponse(swapAmountResult);

        return res.slippage;
    }

    async quote(args: QuoteInput): Promise<QuoteResponse> {
        const [token1, token2] = this.getTokens();

        if (!this.isForToken(args.tokenIn)) {
            throw new Error("Invalid token");
        }

        const tokenIn = args.tokenIn.address === token1.address ? token1 : token2;
        const tokenOut = args.tokenIn.address === token1.address ? token2 : token1;

        const tokenInWithChain = `${tokenIn.chain}.${tokenIn.address}`;
        const tokenOutWithChain = `${tokenOut.chain}.${tokenOut.address}`;

        const swapAmountResult = await this.actor.swap_amounts(
            tokenInWithChain,
            args.amountIn,
            tokenOutWithChain,
        );
        const res = parseResultResponse(swapAmountResult);

        return res.receive_amount;
    }

    async fullQuote(args: QuoteInput): Promise<SwapAmountsReply> {
        const [token1, token2] = this.getTokens();

        if (!this.isForToken(args.tokenIn)) {
            throw new Error("Invalid token");
        }

        const tokenIn = args.tokenIn.address === token1.address ? token1 : token2;
        const tokenOut = args.tokenIn.address === token1.address ? token2 : token1;

        const tokenInWithChain = `${tokenIn.chain}.${tokenIn.address}`;
        const tokenOutWithChain = `${tokenOut.chain}.${tokenOut.address}`;

        const swapAmountResult = await this.actor.swap_amounts(
            tokenInWithChain,
            args.amountIn,
            tokenOutWithChain,
        );
        const res = parseResultResponse(swapAmountResult);

        return res;
    }

    async getMetadata(): Promise<kongswap.PoolMetadata> {
        const poolsResponse = await this.actor.pools([this.poolInfo.address]);
        const poolMetadata = parseResultResponse(poolsResponse);

        if (poolMetadata.pools.length === 0) {
            throw new Error("Pool not found");
        }

        return poolMetadata.pools[0];
    }
    getPoolData(): PoolData {
        return this.poolInfo;
    }
    isForToken(token: Token): boolean {
        if (token.address === this.poolInfo.token1.address) return true;
        if (token.address === this.poolInfo.token2.address) return true;
        return false;
    }
    getTokens(): [Token, Token] {
        return [this.poolInfo.token1, this.poolInfo.token2];
    }
    async getLPInfo(): Promise<GetLPInfoResponse> {
        if ("lp_fee_bps" in this.poolInfo) {
            return {
                token1Address: this.poolInfo.address_0,
                token2Address: this.poolInfo.address_1,
                token1Chain: this.poolInfo.chain_0,
                token2Chain: this.poolInfo.chain_1,
                token1Symbol: this.poolInfo.symbol_0,
                token2Symbol: this.poolInfo.symbol_1,
                token1Balance: this.poolInfo.balance_0,
                token2Balance: this.poolInfo.balance_1,
                lpFeeToken1: this.poolInfo.lp_fee_0,
                lpFeeToken2: this.poolInfo.lp_fee_1,
                lpFee: this.poolInfo.lp_fee_bps,
                price: this.poolInfo.price,
            };
        } else throw new Error("This pair is not a LP pair");
    }
}
