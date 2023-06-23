import * as bodyParser from 'body-parser';
import express from 'express';
import { boot } from 'Reinvest/bootstrap';
import { Identity } from 'Reinvest/Identity/src';
import { IdentityApiType } from 'Reinvest/Identity/src/Port/Api/IdentityApi';
import serverless from 'serverless-http';
import { Verification } from 'Verification/index';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }) as any);
app.use(bodyParser.json() as any);

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

const northCapitalVerificationStatuses = ['Pending', 'Disapproved', 'Manually Approved', 'Auto Approved', 'Need More Info'];

app.post('/webhooks/updateParty', async function (req: any, res: any) {
  console.log(JSON.stringify(req.body));
  const { partyId, KYCstatus: kycStatus, AMLstatus: amlStatus } = req.body;

  if (!partyId || !kycStatus || !northCapitalVerificationStatuses.includes(kycStatus)) {
    console.warn(`No partyId or kycStatus provided`);
    res.json({ status: false });

    return;
  }

  const modules = boot();
  const verificationModule = modules.getApi<Verification.ApiType>(Verification);

  const aml = !amlStatus || !northCapitalVerificationStatuses.includes(amlStatus) ? null : amlStatus;
  await verificationModule.handleNorthCapitalVerificationEvent(partyId);

  await modules.close();

  res.json({ status: true });
});

export const main = serverless(app);
