import { GeneratePdf } from 'Documents/UseCases/GeneratePdf';

export type Template = {
  paragraphs: {
    lines: string[];
    isCheckedOption?: boolean;
  }[];
  header?: string;
}[];

export enum PdfTypes {
  AGREEMENT = 'AGREEMENT',
}

export class PdfController {
  public static getClassName = (): string => 'PdfController';
  private generatePdfUseCase: GeneratePdf;

  constructor(generatePdf: GeneratePdf) {
    this.generatePdfUseCase = generatePdf;
  }
  public async generatePdf(catalog: string, fileName: string, template: Template, type: PdfTypes) {
    const response = await this.generatePdfUseCase.execute(catalog, fileName, template, type);

    return response;
  }
}
