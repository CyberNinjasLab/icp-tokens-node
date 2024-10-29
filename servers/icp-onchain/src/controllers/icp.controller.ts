import { NextFunction, Request, Response } from 'express';
import ic from 'ic0';
import { utils } from '../utils/utils';

const icpswap_service = ic("moe7a-tiaaa-aaaag-qclfq-cai");

export class ICPController {

  public getAllTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Call the service to get all tokens
      const tokens = await icpswap_service.call('getAllTokens');

      // Extract canister IDs
      const canisterIds: string[] = tokens.map((token: { address: string }) => token.address);

      // Send the response
      res.json(JSON.stringify(canisterIds, utils.replacer));
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
  };

}
