import type { PdfGenerator } from './Puppeteer/PdfGenerator';
import type { S3Adapter } from './S3/S3Adapter';

export class MakeScreenshotToPdf {
  private adapter: S3Adapter;
  private pdfGenerator: PdfGenerator;

  constructor(adapter: S3Adapter, pdfGenerator: PdfGenerator) {
    this.adapter = adapter;
    this.pdfGenerator = pdfGenerator;
  }

  public static getClassName = (): string => 'MakeScreenshotToPdf';

  async execute(catalog: string, fileName: string, url: string): Promise<void> {
    const buffer = await this.pdfGenerator.makeScreenshot(url);

    if (!buffer) {
      throw new Error('Error generating pdf');
    }

    await this.adapter.uploadBufferPdf(catalog, fileName, buffer!);
  }
}
