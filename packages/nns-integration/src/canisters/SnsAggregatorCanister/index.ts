// Import configuration and types
import { SNS_AGGREGATOR_CANISTER_URL } from '../../utils/config';
import { SnsAggregatorResponse, CanisterIds } from './types'; // Import types

// Class for interacting with the SNS Aggregator Canister API
export class SnsAggregatorCanister {
  private baseUrl: string; // Base URL of the SNS aggregator canister
  private aggregatorVersion: string; // API version to use
  private pageSize: number; // Number of items per page for paginated requests

  /**
   * Constructor to initialize the SNS Aggregator Canister with optional page size and aggregator version.
   * @param pageSize - Number of results per page (default is 10).
   * @param aggregatorVersion - API version (default is 'v1').
   */
  constructor(pageSize = 10, aggregatorVersion = 'v1') {
    this.baseUrl = SNS_AGGREGATOR_CANISTER_URL;
    this.aggregatorVersion = aggregatorVersion;
    this.pageSize = pageSize;
  }

  /**
   * Helper function to construct the URL for a specific page of SNS data.
   * @param page - The page number to fetch.
   * @returns The URL string for the requested page.
   */
  private getPageUrl(page: number): string {
    return `${this.baseUrl}/${this.aggregatorVersion}/sns/list/page/${page}/slow.json`;
  }

  /**
   * Fetches the latest SNS data from the aggregator canister.
   * @returns A promise that resolves to an array of SnsAggregatorResponse objects.
   * @throws An error if the fetch request fails.
   */
  public async fetchLatestSnsData(): Promise<SnsAggregatorResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.aggregatorVersion}/sns/list/latest/slow.json`);
      console.log(`${this.baseUrl}/${this.aggregatorVersion}/sns/list/latest/slow.json`);
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch data from the SNS aggregator');
      }
      const data: SnsAggregatorResponse[] = await response.json(); // Cast the response to the type
      console.log('Latest SNS data from aggregator:', data);
      return data;
    } catch (error) {
      console.error('Error fetching latest SNS data:', error);
      throw error;
    }
  }

  /**
   * Fetches detailed SNS data for a specific canister ID from the aggregator canister.
   * @param canisterId - The unique identifier of the SNS canister.
   * @returns A promise that resolves to a single SnsAggregatorResponse object.
   * @throws An error if the fetch request fails or if the canister ID is invalid.
   */
  public async fetchSnsDetails(canisterId: string): Promise<SnsAggregatorResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.aggregatorVersion}/sns/root/${canisterId}/slow.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for SNS with canister ID: ${canisterId}`);
      }
      const data: SnsAggregatorResponse = await response.json(); // Cast the response to the type
      console.log(`Details for SNS (${canisterId}):`, data);
      return data;
    } catch (error) {
      console.error('Error fetching SNS details:', error);
      throw error;
    }
  }

  /**
   * Fetches all SNS data using paginated requests.
   * Combines results from multiple pages until all data is retrieved.
   * @returns A promise that resolves to an array of SnsAggregatorResponse objects containing all SNS data.
   * @throws An error if the fetch request for the initial page fails.
   */
  public async fetchAllPaginatedData(): Promise<SnsAggregatorResponse[]> {
    try {
      /**
       * Helper function to recursively fetch data for a specific page.
       * @param page - The page number to fetch.
       * @returns A promise that resolves to an array of SnsAggregatorResponse objects for the page.
       */
      const fetchPage = async (page: number): Promise<SnsAggregatorResponse[]> => {
        const response = await fetch(this.getPageUrl(page));
        if (!response.ok) {
          if (page > 0) {
            return []; // Stop pagination if an intermediate page fails
          }
          throw new Error('Error loading SNS projects from aggregator canister');
        }

        const data: SnsAggregatorResponse[] = await response.json(); // Cast the response to the type

        // If the page has the full set of results, fetch the next page
        if (data.length === this.pageSize) {
          const nextPageData = await fetchPage(page + 1);
          return [...data, ...nextPageData];
        }

        return data;
      };

      const allData = await fetchPage(0); // Start fetching from page 0
      console.log(`Fetched ${allData.length} SNS records.`); 
      return allData;
    } catch (error) {
      console.error('Error fetching all paginated SNS data:', error);
      throw error;
    }
  }
}

// Re-export types for external use
export * from './types';
