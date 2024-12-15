import { GetTransactionsRequest, GetTransactionsResponse, TransactionRange } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';
import { ArchiveBatch, Config, FormattedTransaction, LedgerInstance } from './types';
import ic from 'ic0';
import { parseTransaction } from './transactionUtils';

const MAX_LEDGER_BATCH_SIZE = BigInt(2000);

const DEFAULT_PARALLEL_BATCHES = 10;

export class Ledger {
    private ledger: LedgerInstance;
    private canisterId: string;

    /**
     * Initializes the Ledger instance.
     * 
     * @param canisterId - The Canister ID of the token ledger to interact with.
     * @param config - Optional configuration object.
     */
    constructor(canisterId: string, config: Config = {}) {
        const icInstance = ic(canisterId) as any;
        this.canisterId = canisterId;
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
        return BigInt(await this.ledger.ic.call('get_total_tx').catch(async () => {
            // Fallback mechanism in case 'get_total_tx' fails
            const request: GetTransactionsRequest = { start: BigInt(0), length: BigInt(0) };
            const transactionsInitialCall = await this.ledger.ic.call('get_transactions', request) as GetTransactionsResponse;
            if (transactionsInitialCall && transactionsInitialCall.log_length !== undefined) {
                return transactionsInitialCall.log_length;
            } else {
                throw new Error("Unable to determine total transactions from initial call");
            }
        }));
    }
    
    /**
     * Iterates through all transactions in batches, invoking a callback for each batch.
     * Handles both current and archived transactions.
     * 
     * @param callback - Function to call for each batch of transactions.
     */
    async iterateTransactions(callback: (batch: FormattedTransaction[]) => boolean): Promise<void> {
        const totalTransactions = await this.getTotalTransactions();
        let startSearchIndex = totalTransactions;
        let archivePrincipal = '';
        let end = BigInt(0);
    
        // Debug log: Total transactions count
        if (this.ledger.debug) {
            console.log(`Total Transactions: ${totalTransactions}`);
        }
    
        // Process current ledger transactions in batches
        while (startSearchIndex > BigInt(0)) {
            const length = startSearchIndex < MAX_LEDGER_BATCH_SIZE ? startSearchIndex : MAX_LEDGER_BATCH_SIZE;
            startSearchIndex -= BigInt(length);
    
            if (this.ledger.debug) {
                console.log(`Fetching transactions from index ${startSearchIndex} with length ${length}`);
            }
    
            const request: GetTransactionsRequest = { start: BigInt(startSearchIndex), length: BigInt(length) };
            const transactionsBatch = await this.ledger.ic.call('get_transactions', request) as GetTransactionsResponse;
    
            // Debug log: Transactions batch fetched
            if (this.ledger.debug) {
                console.log(`Fetched ${transactionsBatch.transactions.length} transactions`);
            }
    
            transactionsBatch.transactions.reverse();
    
            const formattedBatch = transactionsBatch.transactions.map((tx, index) => parseTransaction(totalTransactions - BigInt(index) - BigInt(1), tx)).filter(tx => tx !== null);
    
            const continueIteration = callback(formattedBatch as FormattedTransaction[]);
            if (!continueIteration) {
                return;
            }
    
            // Check and cache archived transactions data
            if (transactionsBatch.archived_transactions && transactionsBatch.archived_transactions.length) {
                const archived_transactions: any = transactionsBatch.archived_transactions;
                archivePrincipal = archived_transactions[0].callback[0].toText();
                if (transactionsBatch.first_index) {
                    end = BigInt(transactionsBatch.first_index);
                }
    
                if (this.ledger.debug) {
                    console.log(`Found archived transactions. Archive principal: ${archivePrincipal}, first index: ${end}`);
                }
    
                break;
            }
        }
    
        // If archived transactions are present, process them in batches
        if (archivePrincipal) {
            const archiveCanister = ic(archivePrincipal) as any;
            
            // Get the batch max size of the current archive canister
            const initialRequest: GetTransactionsRequest = { start: BigInt(0), length: BigInt(2000) };
            const initialResponse = await archiveCanister.call('get_transactions', initialRequest) as GetTransactionsResponse;
            const archiveBatchSize = BigInt(initialResponse.transactions.length);

            let startIndex = end - (end % archiveBatchSize);
            let length = startIndex < archiveBatchSize ? startIndex : archiveBatchSize;

            while (startIndex >= BigInt(0)) {
                if (this.ledger.debug) {
                    console.log(`Fetching archived transactions in parallel.`);
                    console.log(`parallel_batches=${this.ledger.parallel_batches}`);
                    console.log(`Index pointer=${startIndex}`)
                }

                // Fetch archive batches in parallel
                const promises: Promise<ArchiveBatch>[] = [];
                for (let i = 0; i < this.ledger.parallel_batches && startIndex >= BigInt(0); i++) {
                    const currentStartIndex = startIndex;
                    const request: GetTransactionsRequest = { start: BigInt(startIndex), length: BigInt(length) };

                    promises.push(
                    archiveCanister.call('get_transactions', request).then((batch: TransactionRange) => ({ startIndex: currentStartIndex, batch }))
                    );

                    if (startIndex === BigInt(0)) {
                        startIndex = BigInt(-1);
                        break;
                    }

                    length = startIndex < archiveBatchSize ? startIndex : archiveBatchSize;
                    startIndex -= BigInt(length);
                }

                const archivedBatches = await Promise.all(promises);
                archivedBatches.forEach(batch => {
                    // Debug log: Archived transactions batch fetched
                    if (this.ledger.debug) {
                        console.log(`Fetched ${batch.batch.transactions.length} archived transactions`);
                        console.log(`Start index of the current batch is ${batch.startIndex}`)
                    }
                    
                    const formattedBatch = batch.batch.transactions.map((tx, index) => parseTransaction(batch.startIndex + BigInt(index), tx)).filter(tx => tx !== null);
                    formattedBatch.reverse();
                    const continueIteration = callback(formattedBatch as FormattedTransaction[]);
                    
                    if (!continueIteration) {
                        return;
                    }
                });

                if (startIndex < BigInt(0)) {
                    break;
                }
            }
        }
    }
  

    /**
     * Filters transactions based on the provided account or principal hash and applies a callback to each filtered batch.
     * The callback can return a boolean indicating whether to continue the iteration.
     * 
     * @param identifier - The account or principal hash string to filter transactions.
     * @param callback - A callback function that receives the filtered transactions and returns a boolean to continue or stop.
     * @returns A promise that resolves when all relevant transactions have been processed or the callback stops the iteration.
     */
    async filterTransactionsByIdentifier(identifier: string, callback: (transactions: FormattedTransaction[]) => boolean): Promise<void> {
        const isRelevantTransaction = (tx: FormattedTransaction): boolean => {
            return (tx.from?.account === identifier || tx.from?.principal === identifier) ||
                (tx.to?.account === identifier || tx.to?.principal === identifier);
        };

        

        await this.iterateTransactions((batch) => {
            const filteredTransactions = batch.filter(isRelevantTransaction);
            if (filteredTransactions.length > 0) {
                // Pass filtered transactions to the provided callback and get decision to continue or stop
                return callback(filteredTransactions);
            }
            return true; // Continue iterating if no relevant transactions are found in the current batch
        });
    }

    /**
     * Counts unique accounts in the transactions (combined from 'from' and 'to' accounts).
     * 
     * @returns A promise that resolves to the count of unique accounts.
     */
    async countUniqueAccounts(): Promise<{ accounts: number, principals: number }> {
        const uniqueAccounts = new Set<string>();
        const uniquePrincipals = new Set<string>();

        await this.iterateTransactions((batch) => {
            batch.forEach(tx => {
                if (tx.from?.account) {
                    uniqueAccounts.add(tx.from.account);
                    uniquePrincipals.add(tx.from.principal);
                }
                if (tx.to?.account) {
                    uniqueAccounts.add(tx.to.account);
                    uniquePrincipals.add(tx.to.principal);
                }
            });
            return true; // Continue iterating through all transactions
        });

        return {
            accounts: uniqueAccounts.size,
            principals: uniquePrincipals.size
        }
    }

    /**
     * Collects holders and their balances and sorts them by balance.
     * 
     * @param sortOrder - Optional. The order to sort the results: 'asc' for ascending, 'desc' for descending. Default is 'desc'.
     * @returns A promise that resolves to an array of objects where each object contains an account identifier, principal, and its balance, sorted by balance.
     */
    async collectHoldersAndBalances(sortOrder: 'asc' | 'desc' = 'desc'): Promise<{ account: string; principal: string; balance: bigint }[]> {
        const holders: Record<string, { account: string; principal: string; subaccount?: string; balance: bigint }> = {};

        const updateBalance = (account: string, principal: string, subaccount: string | undefined, delta: bigint) => {
            if (!holders[account]) {
                holders[account] = { account, principal, subaccount, balance: BigInt(0) };
            }
            holders[account].balance += delta;
        };

        await this.iterateTransactions((batch) => {
            batch.forEach((tx: FormattedTransaction) => {
                if (tx.type === 'mint' && tx.to?.account) {
                    updateBalance(tx.to.account, tx.to.principal, tx.to.subaccount, tx.value);
                } else if (tx.type === 'burn' && tx.from?.account) {
                    updateBalance(tx.from.account, tx.from.principal, tx.from.subaccount, -tx.value);
                } else if (tx.type === 'transfer') {
                    if (tx.from?.account) {
                        updateBalance(tx.from.account, tx.from.principal, tx.from.subaccount, -tx.value);
                    }
                    if (tx.to?.account) {
                        updateBalance(tx.to.account, tx.to.principal, tx.to.subaccount, tx.value);
                    }
                }
    
                if (tx.fee && tx.from?.account) {
                    updateBalance(tx.from.account, tx.from.principal, tx.from.subaccount, -tx.fee);
                }
            });
            return true; // Continue iterating through all transactions
        });
        
        const positiveBalances = Object.values(holders)
            .filter(holder => holder.balance > BigInt(0));

        // Sort the filtered balances
        positiveBalances.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.balance < b.balance ? -1 : a.balance > b.balance ? 1 : 0;
            } else {
                return a.balance > b.balance ? -1 : a.balance < b.balance ? 1 : 0;
            }
        });

        return positiveBalances;
    }

    /**
     * Tracks weekly total holders and weekly new holders by iterating through all transactions.
     * 
     * @returns A promise that resolves to an object containing weekly total holders and weekly new holders.
     */
    async trackWeeklyHolders(): Promise<{ weeklyTotalHolders: { weekStart: string, holders: number }[], weeklyNewHolders: { weekStart: string, holders: number }[] }> {
        const uniqueAccounts = new Set<string>();  // Tracks all unique holders across time
        const weeklyTotalHolders: { weekStart: string, holders: number }[] = [];   // Total holders at the end of each week with week start date
        const weeklyNewHolders: { weekStart: string, holders: number }[] = [];     // New holders for each week with week start date
        const holderTracker: { [weekStart: string]: Set<string> } = {}; // To track holders on a per-week basis using start of the week as keys

        // Helper function to get the start of the week date from a timestamp (Monday as start of the week)
        function getWeekStartDateFromTimestamp(timestamp: number): string {
            const date = new Date(timestamp * 1000);  // assuming timestamp is in seconds

            // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            const dayOfWeek = date.getDay();

            // Calculate the number of days to subtract to get to Monday (start of the week)
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;  // Adjust Sunday (0) to move to the previous Monday

            // Set the date to the previous (or current) Monday
            date.setDate(date.getDate() + diff);

            // Format the date as YYYY-MM-DD
            return date.toISOString().split('T')[0];
        }

        // Iterate through all transactions
        await this.iterateTransactions((batch) => {
            batch.forEach((tx: FormattedTransaction) => {
                // Ensure the timestamp is defined and is of type bigint, then convert to number
                if (tx.timestamp) {
                    let timestampNumber = typeof tx.timestamp === 'bigint' ? Number(tx.timestamp) : tx.timestamp;

                    // Debug log: Log the raw timestamp
                    if (this.ledger.debug) {
                        console.log(`Raw transaction timestamp: ${tx.timestamp}`);
                    }

                    // Check if the timestamp is unreasonably large (likely in nanoseconds)
                    if (timestampNumber > 9999999999) {
                        if (timestampNumber > 1_000_000_000_000_000_000) {
                            console.warn(`Timestamp appears to be in nanoseconds, dividing by 1_000_000_000: ${timestampNumber}`);
                            timestampNumber = Math.floor(timestampNumber / 1_000_000_000);  // Convert from nanoseconds to seconds
                        } else {
                            console.warn(`Timestamp appears to be in milliseconds, dividing by 1000: ${timestampNumber}`);
                            timestampNumber = Math.floor(timestampNumber / 1000);  // Convert from milliseconds to seconds
                        }
                    }

                    const weekStart = getWeekStartDateFromTimestamp(timestampNumber); // Get the start date of the week for this transaction

                    // Initialize the set for the current week (start date of the week) if not already done
                    if (!holderTracker[weekStart]) {
                        holderTracker[weekStart] = new Set<string>();
                    }

                    // Debug log: Timestamp and calculated week start date
                    if (this.ledger.debug) {
                        console.log(`Transaction timestamp: ${timestampNumber}, Week Start: ${weekStart}`);
                    }

                    // Add the "from" and "to" principals to track unique holders
                    if (tx.from?.principal) {
                        uniqueAccounts.add(tx.from.principal);
                        holderTracker[weekStart].add(tx.from.principal);
                        
                        if (this.ledger.debug) {
                            console.log(`Added "from" principal: ${tx.from.principal} for week starting on: ${weekStart}`);
                        }
                    }

                    if (tx.to?.principal) {
                        uniqueAccounts.add(tx.to.principal);
                        holderTracker[weekStart].add(tx.to.principal);

                        if (this.ledger.debug) {
                            console.log(`Added "to" principal: ${tx.to.principal} for week starting on: ${weekStart}`);
                        }
                    }
                } else {
                    // Handle the case where the timestamp is undefined (optional: log or ignore)
                    if (this.ledger.debug) {
                        console.warn('Transaction has no timestamp:', tx);
                    }
                }
            });

            return true;  // Continue iterating through all transactions
        });

        // Ensure that there are weeks to process
        if (Object.keys(holderTracker).length === 0) {
            console.warn('No weekly data to process.');
            return { weeklyTotalHolders: [], weeklyNewHolders: [] };
        }

        // Calculate weekly totals and new holders
        let previousHolders = new Set<string>();  // To track new holders week by week

        // Sort weeks by the start date in chronological order and iterate over them
        Object.keys(holderTracker).sort().forEach(weekStart => {
            const currentWeekHolders = holderTracker[weekStart];

            // Total holders this week: a union of previous holders and current week's holders
            const totalHoldersThisWeek = new Set([...previousHolders, ...currentWeekHolders]);
            weeklyTotalHolders.push({ weekStart, holders: totalHoldersThisWeek.size });

            // New holders this week: holders in the current week that were not in the previous week
            const newHoldersThisWeek = new Set([...currentWeekHolders].filter(x => !previousHolders.has(x)));
            weeklyNewHolders.push({ weekStart, holders: newHoldersThisWeek.size });

            // Debug log: Number of holders and new holders for the week
            if (this.ledger.debug) {
                console.log(`Week Start: ${weekStart}, Total Holders: ${totalHoldersThisWeek.size}, New Holders: ${newHoldersThisWeek.size}`);
            }

            // Update the previousHolders set for the next week
            previousHolders = totalHoldersThisWeek;
        });

        // Return weekly totals and new holders data with the start date of the week
        return {
            weeklyTotalHolders,
            weeklyNewHolders
        };
    }

}

export * from './types';
export * from './transactionUtils';