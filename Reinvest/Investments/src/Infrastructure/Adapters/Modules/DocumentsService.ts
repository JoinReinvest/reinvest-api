import { Documents } from 'Documents/index';

/**
 * Documents Module ACL
 */
export class DocumentsService {
  public static getClassName = () => 'DocumentsService';
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  async generatePdf(profileId: string, subscriptionAgreementId: string) {
    await this.documentsModule.api().generatePdf(profileId, subscriptionAgreementId);
  }
}
