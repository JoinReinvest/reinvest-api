import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { PdfGenerator } from 'Documents/Service/PdfGenerator';

export class PdfService {
  public static getClassName = (): string => 'PdfService';
  private adapter: S3Adapter;

  constructor(adapter: S3Adapter) {
    this.adapter = adapter;
  }

  async uploadBufferPdf(catalog: string, fileName: string) {
    const buffer = await PdfGenerator.getPDF();

    const response = await this.adapter.uploadBufferPdf(catalog, fileName, buffer);

    return response;
  }
}
