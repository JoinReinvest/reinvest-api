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

  public async generatePdf(catalog: string, fileName: string, template: Template, type: PdfTypes): Promise<boolean> {
    try {
      // await this.generatePdfUseCase.execute(catalog, fileName, template, type);

      return true;
    } catch (error: any) {
      console.error(`Generate ${type} PDF for ${catalog}/${fileName}`, error);

      return false;
    }
  }
}
