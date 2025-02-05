import ic from "ic0";

import { FormattedTransaction, Config, LedgerInstance } from "./types";

import { formatIcpTransaction } from "./transactionUtil";

import { ICP_LEDGER_CANISTER_ID } from "./config";

const MAX_LEDGER_BATCH_SIZE = BigInt(2000);
const DEFAULT_PARALLEL_BATCHES = 10;

export class IcpLedger {

    private ledger: LedgerInstance;
    public canisterId: string = ICP_LEDGER_CANISTER_ID;

    constructor(config: Config = {}) {
        const icInstance = ic(this.canisterId) as any;
        this.ledger = {
            ic: icInstance,
            debug: config.debug || false,
            parallel_batches: config.parallelBatches || DEFAULT_PARALLEL_BATCHES,
        };
    }

    public async getTotalTransactions(): Promise<bigint> {
        let result = await this.ledger.ic.call("query_blocks", {
            start: BigInt(0),
            length: BigInt(1),
        });

        return BigInt(result.chain_length);
    }

    public async iterateNewTransactions(latestTransactionId: bigint, callback: (batch: FormattedTransaction[]) => boolean | Promise<boolean>): Promise<void> {
      const totalTransactions = await this.getTotalTransactions();

      let currentIndex = BigInt(latestTransactionId) + BigInt(1);

      while (currentIndex < totalTransactions) {
        const remaining = totalTransactions - currentIndex;
        const length = remaining < MAX_LEDGER_BATCH_SIZE ? remaining : MAX_LEDGER_BATCH_SIZE;

        const result = await this.queryBlocksWithRetry(currentIndex, length);

        if (result.archived_blocks) {
          for (const archive of result.archived_blocks) {
            const archiveCanister = archive.callback[0].toText();
            await this.fetchArchivedTransactionsInRange(archiveCanister, currentIndex, totalTransactions, callback);
          }
        }

        if (!result.blocks || result.blocks.length === 0) {
          break;
        }

        const formattedBatch = result.blocks.map((block: any, index: number) =>
          formatIcpTransaction(currentIndex + BigInt(index), block)
        );

        const continueIteration = await callback(formattedBatch);

        if (!continueIteration) return;

        currentIndex += BigInt(result.blocks.length);
      }
    }

    public async iterateMissingTransactions(missingIds: bigint[], callback: (batch: FormattedTransaction[]) => boolean | Promise<boolean>): Promise<void> {
      if (!missingIds || missingIds.length === 0) {
        console.log("No missing transactions provided.");
        return;
      }
  
      // Sort missing IDs in ascending order.
      missingIds.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  
      // Group contiguous missing IDs into batches.
      const batches: { start: bigint; length: bigint }[] = [];
  
      let batchStart = missingIds[0];
      let batchLength = BigInt(1);
  
      let prevId = missingIds[0];
  
      for (let i = 1; i < missingIds.length; i++) {
        const id = missingIds[i];
        // If the current missing ID is contiguous with the previous one, extend the batch.
        if (id === prevId + BigInt(1)) {
          batchLength++;
        } else {
          // Otherwise, store the current batch and start a new one.
          batches.push({ start: batchStart, length: batchLength });
          batchStart = id;
          batchLength = BigInt(1);
        }
        prevId = id;
      }
  
      // Push the final batch.
      batches.push({ start: batchStart, length: batchLength });
  
      // Process each batch.
      for (const { start, length } of batches) {
        // Attempt to fetch the range from the active ledger.
        const result = await this.queryBlocksWithRetry(start, length);
  
        if (result.blocks && result.blocks.length > 0) {
          const formattedBatch = result.blocks.map((block: any, index: number) =>
            formatIcpTransaction(start + BigInt(index), block)
          );
    
          const continueIteration = await callback(formattedBatch);
  
          if (!continueIteration) return;
        } else if (result.archived_blocks) {
          // If active query returns archived blocks, iterate through each archive.
          for (const archive of result.archived_blocks) {
  
            const archiveCanister = archive.callback[0].toText();
    
            await this.fetchArchivedTransactionsInRange(archiveCanister, start, start + length, callback);
          }
        } else {
          console.warn(`No blocks found for range starting at ${start} with length ${length}`);
        }
      }
    }

    async iterateOldTransactions(callback: (batch: FormattedTransaction[]) => boolean | Promise<boolean>, startSearchIndex?: bigint): Promise<void> {
        const totalTransactions = await this.getTotalTransactions();

        if (!startSearchIndex) {
            startSearchIndex = totalTransactions
        }
    
        while (startSearchIndex > BigInt(0)) {
            const length = startSearchIndex < MAX_LEDGER_BATCH_SIZE ? startSearchIndex : MAX_LEDGER_BATCH_SIZE;
    
            startSearchIndex -= length;
    
            const result = await this.queryBlocksWithRetry(startSearchIndex, length);
    
            if (result.archived_blocks) {
                for (const archive of result.archived_blocks) {
      
                  const archiveCanister = archive.callback[0].toText();
                  // dbLatestIndex is the highest block index you already have in your DB.
                  await this.fetchChainedArchivedTransactions(archiveCanister, startSearchIndex, callback);
                }
              }

            // **Skip empty results if no transactions found**
            if (!result.blocks || result.blocks.length === 0) {
                continue;
            }
    
            const formattedBatch = result.blocks.map((block: any, index: any) =>
                formatIcpTransaction(startSearchIndex! + BigInt(index), block)
            );
    
            const continueIteration = await callback(formattedBatch);
            if (!continueIteration) return;
        }
    }

    async queryBlocksWithRetry(start: bigint, length: bigint, maxRetries = 5): Promise<any> {
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
            return await this.ledger.ic.call("query_blocks", { start, length });
        } catch (error: any) {
            attempt++;

            // If max retries reached, throw error
            if (attempt >= maxRetries) {
                console.error(`query_blocks failed after ${maxRetries} attempts`, error);
                throw error;
            }

            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (2^attempt * 1000ms)
            console.warn(`⚠️ query_blocks failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    async queryArchiveBlocksWithRetry(archiveInstance: any, start: bigint, length: bigint, maxRetries = 5): Promise<any> {
        let attempt = 0;
    
        while (attempt < maxRetries) {
            try {
                return await archiveInstance.call("get_blocks", { start, length });
            } catch (error: any) {
                attempt++;
    
                // If max retries reached, throw error
                if (attempt >= maxRetries) {
                    console.error(`get_blocks failed after ${maxRetries} attempts`, error);
                    throw error;
                }
    
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.warn(`⚠️ get_blocks failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error);
    
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    async getFirstValidIndex(): Promise<bigint> {
        // Try to query starting at 0
        const result = await this.queryBlocksWithRetry(BigInt(0), BigInt(1));

        if (result.Ok) {
          // If it returns Ok, then 0 is valid
          return BigInt(0);
        } else if (result.Err && result.Err.BadFirstBlockIndex) {
          // If an error variant is returned, use the first_valid_index provided
          return BigInt(result.Err.BadFirstBlockIndex.first_valid_index);
        }
        throw new Error("Unable to determine first valid index from the ledger.");
      }

    private async getFirstValidIndexForArchive(archiveInstance: any): Promise<bigint> {
      const result = await this.queryArchiveBlocksWithRetry(archiveInstance, BigInt(0), BigInt(1));
  
      if (result.Ok) {
          // If blocks were returned at 0, then 0 is valid.
          return BigInt(0);
      } else if (result.Err && result.Err.BadFirstBlockIndex) {
          // Use the provided first_valid_index.
          return BigInt(result.Err.BadFirstBlockIndex.first_valid_index);
      }
          throw new Error("Unable to determine first valid index for archive.");
      }

      
    /**
     * Chained archived transactions fetch.
     *
     * This function processes an archive canister in ascending order. Then it subtracts one
     * from that archive’s first valid block index and uses a normal ledger query to test for
     * an earlier archive. When the candidate query returns empty blocks and an archived_blocks field,
     * we extract the new canister id and process that archive in the same way.
     *
     * @param initialArchiveCanister The starting archive canister ID.
     * @param dbLatestIndex The block index up to which you already have data in your DB.
     * @param callback The callback function to process each batch.
     */
    private async fetchChainedArchivedTransactions(
        initialArchiveCanister: string,
        dbLatestIndex: bigint,
        callback: (batch: FormattedTransaction[]) => boolean | Promise<boolean>
    ): Promise<void> {
        let currentArchiveCanister = initialArchiveCanister;
    
        while (true) {
          // Process the current archive in ascending order.
          await this.fetchArchivedTransactionsAscending(currentArchiveCanister, dbLatestIndex, callback);
      
          // Get the first valid index for the current archive.
          const archiveInstance = ic(currentArchiveCanister) as any;
          const archiveFirstIndex = await this.getFirstValidIndexForArchive(archiveInstance);
      
          // If the archive starts at 0, there are no previous blocks.
          if (archiveFirstIndex === BigInt(0)) {
              break;
          }
      
          // Subtract one from the first valid index to form a candidate query.
          const candidateIndex = archiveFirstIndex - BigInt(1);
      
          // Call the normal ledger query with the candidate index.
          const candidateResult = await this.queryBlocksWithRetry(candidateIndex, BigInt(1));
      
          // If the candidate query returns blocks, it means we have reached blocks that exist in the main ledger,
          // so stop chaining.
          if (candidateResult.Ok && candidateResult.Ok.blocks && candidateResult.Ok.blocks.length > 0) {
              break;
          }
      
          // Otherwise, check if archived_blocks is present.
          if (candidateResult.Ok && candidateResult.Ok.archived_blocks && candidateResult.Ok.archived_blocks.length > 0) {
              // Assume the archived_blocks record contains a callback field with the previous archive canister ID.
              // (Adjust the extraction logic as needed for your actual structure.)
              const prevArchiveRecord = candidateResult.Ok.archived_blocks[0];
              if (!prevArchiveRecord.callback) {
              break; // No previous archive indicated.
              }
              // Extract the new archive canister ID.
              // For example, if callback is an object with a toText() method:
              currentArchiveCanister = prevArchiveRecord.callback.toText();
          } else {
              // If neither blocks nor archived_blocks is returned, assume there’s nothing more.
              break;
          }
        }
    }

    private async fetchArchivedTransactionsAscending(archiveCanister: string, dbLatestIndex: bigint, callback: (batch: FormattedTransaction[]) => boolean | Promise<boolean>): Promise<void> {
      const archiveInstance = ic(archiveCanister) as any;
      const archiveFirstIndex = await this.getFirstValidIndexForArchive(archiveInstance);
      let currentIndex = archiveFirstIndex;
    
      while (currentIndex < dbLatestIndex) {
        const remaining = dbLatestIndex - currentIndex;
        const length = remaining > MAX_LEDGER_BATCH_SIZE ? MAX_LEDGER_BATCH_SIZE : remaining;
    
        const result = await this.queryArchiveBlocksWithRetry(archiveInstance, currentIndex, length);
    
        if (!result.Ok || !result.Ok.blocks || result.Ok.blocks.length === 0) {
          break;
        }
    
        const formattedBatch = result.Ok.blocks.map((block: any, index: number) =>
          formatIcpTransaction(currentIndex + BigInt(index), block)
        );
    
        const continueIteration = await callback(formattedBatch);
        if (!continueIteration) {
          break;
        }
    
        currentIndex += BigInt(result.Ok.blocks.length);
      }
    }

  /**
   * Fetches archived transactions in the specified range [fromIndex, toIndex) from the given archive canister,
   * and processes each batch using the provided callback.
   *
   * @param archiveCanister - The archive canister ID.
   * @param fromIndex - The lower bound (inclusive) of the block index range (e.g. last index in your DB + 1).
   * @param toIndex - The upper bound (exclusive) of the block index range.
   * @param callback - A function to process each formatted transaction batch.
   */
  private async fetchArchivedTransactionsInRange(archiveCanister: string, fromIndex: bigint, toIndex: bigint, callback: (batch: FormattedTransaction[]) => boolean | Promise<boolean>): Promise<void> {
    const archiveInstance = ic(archiveCanister) as any;
    
    const archiveFirstIndex = await this.getFirstValidIndexForArchive(archiveInstance);
    
    // We want to start at the higher of the two:
    // - the first valid index in the archive, or
    // - the provided fromIndex (which is your latest DB index + 1).
    let currentIndex = fromIndex > archiveFirstIndex ? fromIndex : archiveFirstIndex;

    // Fetch blocks in batches until we reach the toIndex.
    while (currentIndex < toIndex) {
      const remaining = toIndex - currentIndex;
      const length = remaining < MAX_LEDGER_BATCH_SIZE ? remaining : MAX_LEDGER_BATCH_SIZE;

      const result = await this.queryArchiveBlocksWithRetry(archiveInstance, currentIndex, length);

      if (!result.Ok || !result.Ok.blocks || result.Ok.blocks.length === 0) {
        break;
      }

      const formattedBatch = result.Ok.blocks.map((block: any, index: number) =>
        formatIcpTransaction(currentIndex + BigInt(index), block)
      );

      const continueIteration = await callback(formattedBatch);
      if (!continueIteration) break;

      currentIndex += BigInt(result.Ok.blocks.length);
    }
  }

}
