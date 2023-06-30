import { Documents } from 'Documents/index';
import type { PdfTypes, Template } from 'Investments/Domain/SubscriptionAgreements/types';

/**
 * Documents Module ACL
 */
export class DocumentsService {
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  public static getClassName = () => 'DocumentsService';

  async generatePdf(profileId: string, subscriptionAgreementId: string, template: Template, type: PdfTypes) {
    return false;
    // await this.documentsModule.api().generatePdf(profileId, subscriptionAgreementId, template, type);
  }
}
