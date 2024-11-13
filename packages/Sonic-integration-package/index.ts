import ic from 'ic0';

import { Principal } from '@dfinity/principal';

export interface GetTransactionsResponse {
  data: TransactionData[];
  page: number;
  witness?: WitnessData;
}

// The main structure for each transaction data entry
export interface TransactionData {
  time: bigint;
  operation: string;
  details: TransactionDetail[];
  caller: Principal;
}

export interface TransactionDetail {
  text: string;
  variant: TransactionDetailVariant;
}

export interface TransactionDetailVariant {
  I64?: bigint;
  U64?: bigint;
  Vec?: TransactionDetail[];
  Slice?: Uint8Array;
  TokenIdU64?: bigint;
  Text?: string;
  True?: null;
  False?: null;
  Float?: number;
  Principal?: Principal;
}

export interface WitnessData {
  certificate: Uint8Array;
  tree: Uint8Array;
}

export interface Token {
  id: string;              // Token ID (e.g., "icp", "btc")
  fee: bigint;             // Transaction fee for the token
  decimals: number;        // Number of decimal places for the token
  name: string;            // Full name of the token
  totalSupply: bigint;     // Total supply of the token
  blockStatus: string;     // Current block status (e.g., "active", "paused")
  tokenType: string;       // Type of the token (e.g., "fungible")
  symbol: string;          // Symbol of the token (e.g., "ICP", "BTC")
};

export default class SonicSwapService {

  private ledgerCanister = ic("vemis-oyaaa-aaaah-adpkq-cai");

  private tokensCanister = ic("3xwpq-ziaaa-aaaah-qcn4a-cai");

  public async getLatestTransactions(witness: boolean, page?: number): Promise<TransactionData[]> {
    const response: GetTransactionsResponse = await this.ledgerCanister.call('get_transactions', { witness, page: page ? [page]: [] })
      .catch(err => {
        throw Error(err.message);
      });

    if (!response.data || response.data.length === 0) {
      throw Error(`No transactions found on page: ${page}.`);
    }

    return response.data;
  }

  public async getSupportedTokens(): Promise<Token[]> {
    const response = await this.tokensCanister.call('getSupportedTokenList')
      .catch(err => {
        throw Error(err.message);
      });

    if (response.length === 0) {
      throw Error(`No supported tokens found.`);
     }

    return response;
  }

}
