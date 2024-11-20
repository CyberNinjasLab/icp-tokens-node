import { SNS_AGGREGATOR_CANISTER_URL } from '../../utils/config';
import { SnsAggregatorResponse, CanisterIds } from './types'; // Import types

export class SnsAggregatorCanister {
  private baseUrl: string;
  private aggregatorVersion: string;
  private pageSize: number;

  constructor(pageSize = 10, aggregatorVersion = 'v1') {
    this.baseUrl = SNS_AGGREGATOR_CANISTER_URL;
    this.aggregatorVersion = aggregatorVersion;
    this.pageSize = pageSize;
  }

  private getPageUrl(page: number): string {
    return `${this.baseUrl}/${this.aggregatorVersion}/sns/list/page/${page}/slow.json`;
  }

  // Use the SnsAggregatorResponse type for the return value
  public async fetchLatestSnsData(): Promise<SnsAggregatorResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.aggregatorVersion}/sns/list/latest/slow.json`);
      console.log(`${this.baseUrl}/${this.aggregatorVersion}/sns/list/latest/slow.json`)
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

  // Use a single SnsAggregatorResponse for detailed fetch
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

  // Use SnsAggregatorResponse[] for paginated fetch
  public async fetchAllPaginatedData(): Promise<SnsAggregatorResponse[]> {
    try {
      const fetchPage = async (page: number): Promise<SnsAggregatorResponse[]> => {
        const response = await fetch(this.getPageUrl(page));
        if (!response.ok) {
          if (page > 0) {
            return [];
          }
          throw new Error('Error loading SNS projects from aggregator canister');
        }

        const data: SnsAggregatorResponse[] = await response.json(); // Cast the response to the type

        // If this page has the full set of results, fetch the next page
        if (data.length === this.pageSize) {
          const nextPageData = await fetchPage(page + 1);
          return [...data, ...nextPageData];
        }

        return data;
      };

      const allData = await fetchPage(0);
      console.log('All paginated SNS data:', allData);
      return allData;
    } catch (error) {
      console.error('Error fetching all paginated SNS data:', error);
      throw error;
    }
  }
}

export * from './types';
