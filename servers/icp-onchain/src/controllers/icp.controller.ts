import { NextFunction, Request, Response } from 'express';
import ic from 'ic0';

// Custom replacer function for JSON.stringify to handle BigInt
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  } else {
    return value;
  }
}

const icpswap_service = ic("moe7a-tiaaa-aaaag-qclfq-cai");

export class ICPController {

  public getAllTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Call the service to get all tokens
      const tokens = await icpswap_service.call('getAllTokens');

      // Extract canister IDs
      const canisterIds: string[] = tokens.map((token: { address: string }) => token.address);

      // Send the response
      res.json(JSON.stringify(canisterIds, replacer));
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
  };

}
