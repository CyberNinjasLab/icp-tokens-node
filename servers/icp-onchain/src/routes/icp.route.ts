import { Router } from 'express';
import { ICPController } from '../controllers/icp.controller';
import { Routes } from '../interfaces/routes.interface';

export class ICPRoute implements Routes {
  public path = '/api';
  public router: Router = Router();
  public icpController = new ICPController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/tokens`, this.icpController.getAllTokens);
  }
}
