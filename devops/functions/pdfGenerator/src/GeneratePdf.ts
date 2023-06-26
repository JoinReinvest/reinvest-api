import HTMLParser from './HTMLParser';
import type { PdfGenerator } from './Puppeteer/PdfGenerator';
import type { S3Adapter } from './S3/S3Adapter';
import { PdfTypes, Template } from './Types';

export class GeneratePdf {
  private adapter: S3Adapter;
  private pdfGenerator: PdfGenerator;

  constructor(adapter: S3Adapter, pdfGenerator: PdfGenerator) {
    this.adapter = adapter;
    this.pdfGenerator = pdfGenerator;
  }

  public static getClassName = (): string => 'GeneratePdf';

  async execute(catalog: string, fileName: string, template: Template, type: PdfTypes): Promise<void> {
    const htmlParser = new HTMLParser(type, template);

    const html = htmlParser.getHTML();
    const buffer = await this.pdfGenerator.generatePdfFromHtml(html);

    if (!buffer) {
      throw new Error('Error generating pdf');
    }

    await this.adapter.uploadBufferPdf(catalog, fileName, buffer!);
  }
}
