import ic from 'ic0';
import { FormattedTransaction, Config, LedgerInstance } from '../icrc-transactions-adapter/types';
import { ICP_LEDGER_CANISTER_ID } from './config';

const MAX_LEDGER_BATCH_SIZE = BigInt(2000);

const DEFAULT_PARALLEL_BATCHES = 10;

export class IcpLedger {
    private ledger: LedgerInstance;
    public canisterId: string = ICP_LEDGER_CANISTER_ID;

    /**
     * Initializes the Ledger instance.
     * 
     * @param canisterId - The Canister ID of the token ledger to interact with.
     * @param config - Optional configuration object.
     */
    constructor(config: Config = {}) {
        const icInstance = ic(this.canisterId) as any;
        this.ledger = {
            ic: icInstance,
            debug: config.debug || false,
            parallel_batches: config.parallelBatches || DEFAULT_PARALLEL_BATCHES
        };
    }

    /**
     * Retrieves the total number of transactions from the ledger.
     * 
     * @returns A promise that resolves to the total number of transactions as a bigint.
     */
    async getTotalTransactions(): Promise<bigint> {
      let result = await this.ledger.ic.call('query_blocks', {
        start: 0,
        length: 1
      });

      return result.chain_length;
    }
    
    /**
     * Iterates through all transactions in batches, invoking a callback for each batch.
     * Handles both current and archived transactions.
     * 
     * @param callback - Function to call for each batch of transactions.
     */
    async iterateTransactions(callback: (batch: FormattedTransaction[]) => boolean): Promise<void> {
        
    }
}