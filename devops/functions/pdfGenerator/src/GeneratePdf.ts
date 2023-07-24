import { Template } from 'Templates/Template';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';

import type { PdfGenerator } from './Puppeteer/PdfGenerator';
import type { S3Adapter } from './S3/S3Adapter';

export class GeneratePdf {
  private adapter: S3Adapter;
  private pdfGenerator: PdfGenerator;

  constructor(adapter: S3Adapter, pdfGenerator: PdfGenerator) {
    this.adapter = adapter;
    this.pdfGenerator = pdfGenerator;
  }

  public static getClassName = (): string => 'GeneratePdf';

  async execute(catalog: string, fileName: string, templateName: Templates, version: TemplateVersion, content: TemplateContentType): Promise<void> {
    const template = new Template(templateName, content, version);
    const html = template.toHtml();
    const buffer = await this.pdfGenerator.generatePdfFromHtml(html);

    if (!buffer) {
      throw new Error('Error generating pdf');
    }

    await this.adapter.uploadBufferPdf(catalog, fileName, buffer!);
  }
}
