import { Documents } from 'Documents/index';

export type FileLink = {
  id: string;
  url: string;
};

/**
 * Documents Module ACL
 */
export class RegistrationDocumentsService {
  public static getClassName = () => 'RegistrationDocumentsService';
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  async getDocumentFileLink(id: string, path: string): Promise<FileLink> {
    return await this.documentsModule.api().getDocumentLink(id, path);
  }
}
