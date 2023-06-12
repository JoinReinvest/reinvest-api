import axios, { AxiosResponse } from 'axios';
import puppeteer from 'puppeteer';

import { getTemplate } from './templates/pdf-template';

export class PdfGenerator {
  static getPDFBuffer = async (html: string, options: any): Promise<any> => {
    let browser = null;
    try {
      const endpoint = process.env.CHROMIUM_ENDPOINT ?? 'http://localhost:3000';
      const chromiumPath: AxiosResponse<{ path: string }> = await axios.get(`${endpoint}/chromium`);

      const path = chromiumPath.data.path;

      browser = await puppeteer.launch({
        args: puppeteer.defaultArgs(),
        executablePath: path,
        headless: 'new',
      });

      const page = await browser.newPage();

      const loaded = page.waitForNavigation({
        waitUntil: 'load',
      });

      await page.setContent(html);
      await loaded;

      return await page.createPDFStream(options);
    } catch (error) {
      return error;
    }
  };

  static getPDF = async () => {
    try {
      const html = getTemplate({ name: 'Keshav' });
      const options = {
        format: 'A4',
        printBackground: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      };

      const pdf = await PdfGenerator.getPDFBuffer(html, options);

      return pdf;
    } catch (error) {
      console.error('Error : ', error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error,
          message: 'Something went wrong',
        }),
      };
    }
  };
}
