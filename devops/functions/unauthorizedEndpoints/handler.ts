import { boot } from 'Reinvest/bootstrap';
import { Identity } from 'Reinvest/Identity/src';
import { IdentityApiType } from 'Reinvest/Identity/src/Port/Api/IdentityApi';
import serverless from 'serverless-http';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/incentive-token', async function (req: any, res: any) {
  const modules = boot();
  const { token } = req.body;

  if (!token) {
    res.json({ status: false });
  }

  const identityModule = modules.getApi<IdentityApiType>(Identity);
  const status = await identityModule.isIncentiveTokenValid(token);
  res.json({ status });
});

export const main = serverless(app);
