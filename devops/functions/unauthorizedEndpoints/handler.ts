import * as bodyParser from 'body-parser';
import { Documents } from 'Documents/index';
import express from 'express';
import { Investments } from 'Investments/index';
import { Portfolio } from 'Portfolio/index';
import { boot } from 'Reinvest/bootstrap';
import { Identity } from 'Reinvest/Identity/src';
import { IdentityApiType } from 'Reinvest/Identity/src/Port/Api/IdentityApi';
import serverless from 'serverless-http';
import { Trading } from 'Trading/index';
import { Verification } from 'Verification/index';
import { Notifications } from 'Notifications/index';
import { EmailSender, EmailTemplate } from 'Notifications/Adapter/SES/EmailSender';

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

app.post('/webhooks/updateOffering', async function (req: any, res: any) {
  const modules = boot();
  const api = modules.getApi<Portfolio.ApiType>(Portfolio);

  const { portfolioId } = await api.getActivePortfolio();
  await api.synchronizeNav(portfolioId);

  await modules.close();

  res.json({ status: true });
});

app.post('/webhooks/updateTrade', async function (req: any, res: any) {
  const modules = boot();
  const { tradeId } = req.body;
  const investmentApi = modules.getApi<Investments.ApiType>(Investments);
  const tradingApi = modules.getApi<Trading.ApiType>(Trading);
  const investmentId = await tradingApi.getInvestmentIdByTradeId(tradeId);

  if (!investmentId) {
    return;
  }

  await investmentApi.pushTransaction(investmentId);
  await modules.close();

  res.json({ status: true });
});

app.post('/calculations', async function (req: any, res: any) {
  const modules = boot();
  const { token, calculations } = req.body;

  const documentsApi = modules.getApi<Documents.ApiType>(Documents);
  const identityApi = modules.getApi<Identity.ApiType>(Identity);
  const profileId = await identityApi.profileIdDecrypt(token);

  if (!documentsApi || !profileId) {
    return;
  }

  const calculationId = await documentsApi.addCalculation(profileId as string, calculations);
  await modules.close();

  res.json({ status: true, calculationId });
});

app.post('/calculations/pdf', async function (req: any, res: any) {
  const modules = boot();
  const { token, url } = req.body;
  const documentsApi = modules.getApi<Documents.ApiType>(Documents);
  const identityApi = modules.getApi<Identity.ApiType>(Identity);

  const profileId = await identityApi.profileIdDecrypt(token);

  if (!documentsApi || !profileId) {
    return;
  }

  const pdfId = await documentsApi.renderPageToPdf(profileId as string, 'calculation', url);

  if (!pdfId) {
    return;
  }

  const pdfUrl = await documentsApi.getRenderedPageLink(profileId as string, pdfId);

  await modules.close();

  res.json({ status: true, pdfUrl });
});

app.post('/calculations/:id', async function (req: any, res: any) {
  const modules = boot();
  const { id } = req.params;

  const documentsApi = modules.getApi<Documents.ApiType>(Documents);

  if (!documentsApi) {
    return;
  }

  const calculationData = await documentsApi.getCalculation(id);

  await modules.close();

  res.json({ status: true, data: calculationData });
});

app.post('/calculations/:id/share', async function (req: any, res: any) {
  const modules = boot();
  const { email } = req.body;
  const { id } = req.params;
  const notificationApi = modules.getApi<Notifications.ApiType>(Notifications);
  const data = await notificationApi.sendEmail(email, `${process.env.WEB_URL}/calculation/${id}`);

  res.json({ status: true, data });
});

export const main = serverless(app, {
  basePath: process.env.BASE_PATH,
});
