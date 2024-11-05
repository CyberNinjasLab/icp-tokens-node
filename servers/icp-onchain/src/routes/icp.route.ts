import { Router } from 'express';
import { ICPController } from './../controllers/icp.controller';

import CatchUtil from './../utils/catch.util';

const useCatch = CatchUtil.getUseCatch();
const icpController = new ICPController();

const ICPRouter: Router = Router();

ICPRouter.get('/', useCatch(icpController.getAllTokens));

export default ICPRouter;
