export interface PointerData {
    canisterId: string;
    transactionIndex: bigint | number;
    dexServiceName: string;
}

/**
 * Pointer class to keep track of the last processed transaction from a DEX service.
 * Stores the canister ID, transaction index, and DEX service name.
 */
export class Pointer {
    private canisterId: string;
    private transactionIndex: bigint;
    private dexServiceName: string;

    /**
     * Create a new Pointer instance
     * @param dexServiceName - The name of the DEX service
     * @param canisterId - The canister ID where the transaction is located
     * @param transactionIndex - The index of the last processed transaction
     */
    constructor(dexServiceName: string, canisterId: string, transactionIndex: bigint | number) {
        this.dexServiceName = dexServiceName;
        this.canisterId = canisterId;
        this.transactionIndex = BigInt(transactionIndex);
    }

    /**
     * Convert the pointer to a plain object
     */
    toObject(): PointerData {
        return {
            canisterId: this.canisterId,
            transactionIndex: this.transactionIndex,
            dexServiceName: this.dexServiceName,
        };
    }

    /**
     * Create a Pointer from a plain object
     */
    static fromObject(data: PointerData): Pointer {
        return new Pointer(
            data.dexServiceName,
            data.canisterId,
            data.transactionIndex
        );
    }
}