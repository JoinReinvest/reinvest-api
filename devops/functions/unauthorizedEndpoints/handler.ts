import * as bodyParser from 'body-parser';
import express from 'express';
import { boot } from 'Reinvest/bootstrap';
import { Identity } from 'Reinvest/Identity/src';
import { IdentityApiType } from 'Reinvest/Identity/src/Port/Api/IdentityApi';
import serverless from 'serverless-http';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }) as any);

app.post('/incentive-token', async function (req: any, res: any) {
  const modules = boot();
  const { token } = req.body;
  console.log({ token, body: req.body });

  if (!token) {
    console.warn(`No token provided`);
    res.json({ status: false });

    return;
  }

  const identityModule = modules.getApi<IdentityApiType>(Identity);
  const status = await identityModule.isIncentiveTokenValid(token);
  await modules.close();
  res.json({ status });
});

export const main = serverless(app);
