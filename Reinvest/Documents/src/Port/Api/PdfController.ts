import { PdfService } from 'Documents/Adapter/S3/PdfService';

export class PdfController {
  public static getClassName = (): string => 'PdfController';
  private pdfService: PdfService;

  constructor(pdfService: PdfService) {
    this.pdfService = pdfService;
  }
  public async generatePdf(catalog: string, fileName: string) {
    const response = await this.pdfService.uploadBufferPdf(catalog, fileName);

    return response;
  }
}
