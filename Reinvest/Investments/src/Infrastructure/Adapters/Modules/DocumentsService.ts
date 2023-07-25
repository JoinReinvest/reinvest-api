import { Documents } from 'Documents/index';
import type { PdfTypes, TemplateStructureType } from 'Templates/Types';

/**
 * Documents Module ACL
 */
export class DocumentsService {
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  public static getClassName = () => 'DocumentsService';

  async generatePdf(profileId: string, subscriptionAgreementId: string, template: TemplateStructureType, type: PdfTypes) {
    return false;
    // await this.documentsModule.api().generatePdf(profileId, subscriptionAgreementId, subscriptionAgreementTemplate, type);
  }
}
