import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';

export type FileLink = {
  id: string;
  url: string;
};

export enum FileType {
  AVATAR = 'Avatar',
  DOCUMENT = 'Document',
}

export class FileLinkService {
  private adapter: S3Adapter;
  private idGenerator: IdGeneratorInterface;

  constructor(adapter: S3Adapter, idGenerator: IdGeneratorInterface) {
    this.adapter = adapter;
    this.idGenerator = idGenerator;
  }

  public static getClassName = (): string => 'FileLinkService';

  async createFileLinks(type: FileType, catalog: string, numberOfLinks: number = 1): Promise<FileLink[]> {
    const fileLinks = <FileLink[]>[];

    for (let i = 0; i < numberOfLinks; i++) {
      const id = this.idGenerator.createUuid();
      const url =
        type === FileType.AVATAR
          ? await this.adapter.generatePutSignedUrlForAvatar(catalog, id)
          : await this.adapter.generatePutSignedUrlForDocument(catalog, id);

      fileLinks.push({ url, id });
    }
    return fileLinks;
  }

  async getAvatarFileLink(id: string, catalog: string): Promise<FileLink> {
    const url = await this.adapter.getSignedGetUrl(FileType.AVATAR, catalog, id);

    return { id, url };
  }

  async getDocumentFileLink(id: string, catalog: string): Promise<FileLink> {
    const url = await this.adapter.getSignedGetUrl(FileType.DOCUMENT, catalog, id);

    return { id, url };
  }
}
