import axios, { AxiosResponse } from 'axios';
import puppeteer from 'puppeteer';

export class PdfGenerator {
  private chromiumEndpoint: string;
  public static getClassName = (): string => 'PdfGenerator';

  constructor(chromiumEndpoint: string) {
    this.chromiumEndpoint = chromiumEndpoint;
  }

  private getPDFBuffer = async (html: string, options: any): Promise<any> => {
    let browser = null;
    try {
      const chromiumPath: AxiosResponse<{ path: string }> = await axios.get(`${this.chromiumEndpoint}/chromium`);

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

      await page.pdf(options);

      return await page.createPDFStream(options);
    } catch (error) {
      return error;
    }
  };

  generatePdfFromHtml = async (html: string) => {
    try {
      const options = {
        format: 'A4',
        printBackground: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        path: 'test.pdf',
      };

      const pdf = await this.getPDFBuffer(html, options);

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
