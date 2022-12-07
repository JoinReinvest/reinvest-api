import serverless from 'serverless-http';

import { app } from '../../Reinvest/ApiGateway';

export const main = serverless(app, { provider: 'aws' });
