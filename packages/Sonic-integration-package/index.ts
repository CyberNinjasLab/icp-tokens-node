import ic from 'ic0';

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
  Principal?: string; // `Principal` can also be imported from the IC SDK if available
}

// Each detail record has text and a variant field
export interface TransactionDetail {
  text: string;
  variant: TransactionDetailVariant;
}

// The main structure for each transaction data entry
export interface TransactionData {
  time: bigint;
  operation: string;
  details: TransactionDetail[];
  caller: string; // Use Principal type if needed
}

// Optional witness data in the response
export interface WitnessData {
  certificate: Uint8Array;
  tree: Uint8Array;
}

// Response structure of get_transactions
export interface GetTransactionsResponse {
  data: TransactionData[];
  page: number;
  witness?: WitnessData;
}

export default class SonicSwapService {

  private ledger = ic("vemis-oyaaa-aaaah-adpkq-cai");

  public async getLatestTransactions(witness: boolean, page?: number): Promise<any> {
    const data = await this.ledger.call('get_transactions', { witness: false, page: Number(page) })
      .catch(err => {
        console.log(err.message);
      });

    if (!data) {
      return;
    }

    console.log(data);
  }

}

