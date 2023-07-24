import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import RenderPageToPdf from 'Documents/UseCases/RenderPageToPdf';
import { Pagination, UUID } from 'HKEKTypes/Generics';

import GetRenderedPageLink from '../../UseCases/GetRenderedPageLink';
import ListRenderedPage from '../../UseCases/ListRenderedPage';

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
  private renderPageToPdfUseCase: RenderPageToPdf;
  private getRenderedPageLinkUseCase: GetRenderedPageLink;
  private listRenderedPageUseCase: ListRenderedPage;

  constructor(renderPageToPdfUseCase: RenderPageToPdf, getRenderedPageLinkUseCase: GetRenderedPageLink, listRenderedPageUseCase: ListRenderedPage) {
    this.renderPageToPdfUseCase = renderPageToPdfUseCase;
    this.getRenderedPageLinkUseCase = getRenderedPageLinkUseCase;
    this.listRenderedPageUseCase = listRenderedPageUseCase;
  }

  public async generatePdf(catalog: string, fileName: string, template: Template, type: PdfTypes): Promise<boolean> {
    try {
      // await this.generatePdfUseCase.execute(catalog, fileName, template, type);

      return true;
    } catch (error: any) {
      console.error(`Generate ${type} PDF for ${catalog}/${fileName}`, error);

      return false;
    }
  }

  public async renderPageToPdf(profileId: UUID, name: string, url: string) {
    try {
      return await this.renderPageToPdfUseCase.execute(profileId, name, url);
    } catch (error: any) {
      console.error(`Generate ${url} page to pdf for ${profileId}/calculations/:id`, error);

      return false;
    }
  }

  public async getRenderedPageLink(profileId: UUID, id: UUID): Promise<FileLink | null> {
    try {
      return await this.getRenderedPageLinkUseCase.execute(profileId, id);
    } catch (error: any) {
      return null;
    }
  }

  public async listRenderedPages(profileId: UUID, pagination: Pagination = { page: 0, perPage: 10 }) {
    try {
      return await this.listRenderedPageUseCase.execute(profileId, pagination);
    } catch (error: any) {
      return [];
    }
  }
}
