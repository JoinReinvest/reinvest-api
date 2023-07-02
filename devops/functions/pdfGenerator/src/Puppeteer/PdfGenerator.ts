import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer';

export class PdfGenerator {
  private readonly chromiumEndpoint: string;

  constructor(chromiumEndpoint: string) {
    this.chromiumEndpoint = chromiumEndpoint;
    // console.log({ chromiumEndpoint });
  }

  async getPuppeteerConfig() {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(this.chromiumEndpoint),
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    return browser;
  }
  async generatePdfFromHtml(html: string): Promise<Buffer | null> {
    try {
      const options = {
        format: 'A4',
        printBackground: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      };

      return await this.getPDFBuffer(html, options);
    } catch (error) {
      console.error('Error : ', error);

      return null;
    }
  }

  async makeScreenshot(url: string) {
    try {
      const browser = await this.getPuppeteerConfig();

      const page = await browser.newPage();

      const website_url = url ?? 'https://yog9.github.io/SnapShot/#/SnapScout/mountain';

      await page.goto(website_url, { waitUntil: 'networkidle0' });

      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
        printBackground: true,
        format: 'A4',
      });

      await browser.close();

      return pdf;
    } catch (error) {
      console.error('Error : ', error);

      return null;
    }
  }
  private async getPDFBuffer(html: string, options: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(this.chromiumEndpoint),
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    const loaded = page.waitForNavigation({
      waitUntil: 'load',
    });

    await page.setContent(html);
    await loaded;

    return page.pdf(options);
  }
}
