import { Request, Response } from 'express';

import ic from 'ic0';

import { utils } from './../utils/utils';

import { HttpException } from './../exceptions/HttpException';

export class ICPController {

  private logContext = 'ICP Controller';

  private icpswap_service = ic("moe7a-tiaaa-aaaag-qclfq-cai");

  public getAllTokens = async (req: Request, res: Response): Promise<void> => {
    const logContext = `${this.logContext} -> getAllTokens()`;

    // Call the service to get all tokens
    const tokens = await this.icpswap_service.call('getAllTokens')
      .catch(err => {
        throw new HttpException(500, err.message, logContext);
      })

    // Extract canister IDs
    const canisterIds: string[] = tokens.map((token: { address: string }) => token.address);

    // Send the response
    res.json(JSON.stringify(canisterIds, utils.replacer));
  };

}
