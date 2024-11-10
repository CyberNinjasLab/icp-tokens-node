import { Request, Response, NextFunction, RequestHandler } from 'express';

export default class CatchUtil {

  public static getUseCatch() {
    return (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => 
      Promise.resolve(fn(req, res, next)).catch(next);
  }

}
