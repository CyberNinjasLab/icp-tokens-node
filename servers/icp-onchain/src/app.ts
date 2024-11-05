
import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from './config';

import logger from './utils/logger.util';

import ErrorMiddleware from './middlewares/error.middleware';

import MainRouter from './routes/main.router';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();

    this.app.use(MainRouter);
    this.app.use(new ErrorMiddleware().init);
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`
        \n ======= ENV: ${this.env} ======= 
        \n 🚀 App listening on the port ${this.port} 
        \n =================================`
      );
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT || 'dev'));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

}
