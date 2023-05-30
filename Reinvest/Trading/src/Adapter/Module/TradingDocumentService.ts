import { Documents } from 'Documents/index';

export type FileLink = {
  id: string;
  url: string;
};

/**
 * Documents Module ACL
 */
export class TradingDocumentService {
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  static getClassName = () => 'TradingDocumentService';

  async getDocumentFileLink(id: string, path: string): Promise<FileLink> {
    return await this.documentsModule.api().getDocumentLink(id, path);
  }
}
