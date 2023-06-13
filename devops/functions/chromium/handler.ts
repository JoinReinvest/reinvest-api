import chromium from '@sparticuz/chromium';
import * as bodyParser from 'body-parser';
import express from 'express';
import serverless from 'serverless-http';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }) as any);
app.use(bodyParser.json() as any);

app.get('/chromium', async function (req: any, res: any) {
  const path = process.env.CHROME_URL ?? (await chromium.executablePath());

  res.json({ path });
});
export const main = serverless(app);
