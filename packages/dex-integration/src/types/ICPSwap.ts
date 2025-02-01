import { PublicPoolOverView } from "./actors/icpswap/icpswapNodeIndex";
import { PoolMetadata as ActorPoolMetadata, SwapArgs } from "./actors/icpswap/icpswapPool";
import { Token as GeneralToken } from "./shared";
import { Transaction as IcpSwapTransaction } from "./actors/icpswap/icpswapBaseStorage";
import { icsBaseStorage } from "./actors";

export type Transaction = IcpSwapTransaction;

export type Token = GeneralToken & {
    standard: string;
    id?: bigint;
    volumeUSD1d?: number;
    volumeUSD7d?: number;
    totalVolumeUSD?: number;
    volumeUSD?: number;
    feesUSD?: number;
    priceUSDChange?: number;
    txCount?: bigint;
    priceUSD?: number;
    symbol: string;
    name: string;
};

export type BaseStorageActor = icsBaseStorage._SERVICE & {
    canister_id: string;
};

export type PoolMetadata = ActorPoolMetadata;

export type SwapInput = SwapArgs;

export type PoolInfo = PublicPoolOverView;

export type UserUnusedBalance = {
    token1: bigint;
    token2: bigint;
};
