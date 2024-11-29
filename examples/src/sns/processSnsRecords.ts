// Import the SnsAggregatorCanister class and required types
import { SnsAggregatorCanister, SnsAggregatorResponse } from '@icp-tokens-node/nns-integration-package';

/**
 * This script fetches all paginated SNS data, retrieves details for each SNS,
 * and collects the detailed information into a single array.
 * 
 * The collected data can later be processed to create or update existing SNS records.
 */

const fetchAndProcessSnsData = async (): Promise<SnsAggregatorResponse[]> => {
  // Create an instance of SnsAggregatorCanister with default parameters
  const snsAggregator = new SnsAggregatorCanister();

  try {
    console.log('Fetching all paginated SNS data...');
    const paginatedData = await snsAggregator.fetchAllPaginatedData();

    for (const sns of paginatedData) {
      // INFO: Lifecycle values to descriptive states: 1-Pending, 2-Open, 3-Committed, 4-Aborted, 5-Adopted, default-Unspecified.
      // SOURCE: https://github.com/dfinity/nns-dapp/blob/79073e9ed9958509e3d3ede90bfffd9481b539cb/rs/sns_aggregator/src/index.html#L492

      // TODO: CreateOrUpdate Key info
      // Metadata
      // TokenLedgerId: sns.canister_ids.ledger_canister_id // To store in our internal Token Ledgers table...
      // GovernanceId: sns.canister_ids.governance_canister_id // To cache ICP & Token treasuries
      console.log(sns.meta.name);
    }

    console.log('All SNS data fetched successfully.');
    return paginatedData;
  } catch (error) {
    console.error('Error during SNS data fetching and processing:', error);
    throw error;
  }
};

try {
  // Fetch and process SNS data
  console.log('Starting to fetch and process SNS data...');
  const detailedSnsRecords = await fetchAndProcessSnsData();

  // Example: Print the detailed records to the console (or process them further)
  // console.log('Collected detailed SNS records:', detailedSnsRecords);

  // Here, you can add logic to create or update SNS records in your service or database
  // e.g., saveRecordsToDatabase(detailedSnsRecords);

} catch (error) {
  console.error('Error while processing SNS records:', error);
}