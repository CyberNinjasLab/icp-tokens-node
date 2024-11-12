import { ErrorRequestHandler } from 'express';

import { HttpException } from '../exceptions/HttpException';

export default class ErrorMiddleware {

  public init: ErrorRequestHandler = (err: HttpException, req, res, next) => {
    this.log(err);

    const status = err.status || 500;
    let message = err.message || 'Something went wrong. Please try again later.';

    if (err.status === 500) {
      message = 'Internal Server Error.';
    }

    res.status(status).send({ message });
  }

  private log(err: HttpException): void {
    if (err.source) {
      logger.error(err.message, err.source, err.sendEmail);
    }
  }

}
