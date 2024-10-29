import { App } from './index';
import { ICPRoute } from './routes/icp.route';

const app = new App([new ICPRoute()]);

app.listen();
