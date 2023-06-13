import { Documents } from 'Documents/index';
import type { PdfTypes, Template } from 'Investments/Domain/SubscriptionAgreements/types';

/**
 * Documents Module ACL
 */
export class DocumentsService {
  public static getClassName = () => 'DocumentsService';
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  async generatePdf(profileId: string, subscriptionAgreementId: string, template: Template, type: PdfTypes) {
    await this.documentsModule.api().generatePdf(profileId, subscriptionAgreementId, template, type);
  }
}
