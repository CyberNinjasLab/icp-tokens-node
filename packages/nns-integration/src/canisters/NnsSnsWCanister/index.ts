import { AgentCanister, ic } from 'ic0';
import { NNS_SNS_W_CANISTER_ID } from '../../utils/config';
import { SnsListResponse } from './types';

export class NnsSnsWCanister {
  private canister: AgentCanister;

  constructor() {
    // Initialize the canister
    this.canister = ic(NNS_SNS_W_CANISTER_ID);
  }

  /**
   * Fetches the list of deployed SNSes.
   * @returns {Promise<SnsListResponse>} List of deployed SNS instances.
   */
  public async listDeployedSnses(): Promise<SnsListResponse> {
    try {
      // Call the `list_deployed_snses` method on the canister
      const result: SnsListResponse = await this.canister.call("list_deployed_snses", []);

      return result;
    } catch (error) {
      console.error('Error fetching deployed SNSes:', error);
      throw error;
    }
  }
}

export * from './types';