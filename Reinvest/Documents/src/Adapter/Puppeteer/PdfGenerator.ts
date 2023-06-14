import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer';

export class PdfGenerator {
  private readonly chromiumEndpoint: string;

  constructor(chromiumEndpoint: string) {
    this.chromiumEndpoint = chromiumEndpoint;
  }

  public static getClassName = (): string => 'PdfGenerator';

  generatePdfFromHtml = async (html: string): Promise<Buffer | null> => {
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
  };

  private getPDFBuffer = async (html: string, options: any): Promise<Buffer> => {
    let browser = null;
    console.log('default puppeteer args: ', puppeteer.defaultArgs());
    browser = await puppeteer.launch({
      // args: puppeteer.defaultArgs(),
      args: ['--no-sandbox'],
      executablePath: await chromium.executablePath(this.chromiumEndpoint),
      headless: true,
    });

    const page = await browser.newPage();

    const loaded = page.waitForNavigation({
      waitUntil: 'load',
    });

    await page.setContent(html);
    await loaded;

    return page.pdf(options);
  };
}
