import type { PdfGenerator } from 'Documents/Adapter/Puppeteer/PdfGenerator';
import type { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import type { PdfTypes, Template } from 'Documents/Port/Api/PdfController';
import HTMLParser from 'Documents/Service/HTMLParser';

export class GeneratePdf {
  public static getClassName = (): string => 'GeneratePdf';
  private adapter: S3Adapter;
  private pdfGenerator: PdfGenerator;

  constructor(adapter: S3Adapter, pdfGenerator: PdfGenerator) {
    this.adapter = adapter;
    this.pdfGenerator = pdfGenerator;
  }

  async execute(catalog: string, fileName: string, template: Template, type: PdfTypes) {
    const htmlParser = new HTMLParser(type, template);

    const html = htmlParser.getHTML();
    const buffer = await this.pdfGenerator.generatePdfFromHtml(html);

    const response = await this.adapter.uploadBufferPdf(catalog, fileName, buffer);

    return response;
  }
}
