import { Router } from 'express';

import ICPRouter from './icp.route';

const MainRouter: Router = Router();

MainRouter.use('/api/tokens', ICPRouter);

export default MainRouter;
