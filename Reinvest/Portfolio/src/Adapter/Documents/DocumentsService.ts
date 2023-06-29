import { FileLink } from 'Documents/Adapter/S3/FileLinkService';
import { Documents } from 'Documents/index';
import { FileInput } from 'LegalEntities/Domain/ValueObject/Document';

/**
 * Documents Module ACL
 */
export class DocumentsService {
  public static getClassName = () => 'DocumentsService';
  private documentsModule: Documents.Main;

  constructor(documentsModule: Documents.Main) {
    this.documentsModule = documentsModule;
  }

  async getImageFileLink(fileInput: FileInput | null): Promise<FileLink | object> {
    if (fileInput === null) {
      return {};
    }

    const { id, path } = fileInput;

    return this.documentsModule.api().getImageLink(id, path);
  }
}
