import { S3Adapter } from 'Documents/Adapter/S3/S3Adapter';
import { CacheService } from 'Documents/Service/CacheService';
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
  public static getClassName = (): string => 'FileLinkService';
  private adapter: S3Adapter;
  private cacheService: CacheService;
  private idGenerator: IdGeneratorInterface;

  constructor(adapter: S3Adapter, cacheService: CacheService, idGenerator: IdGeneratorInterface) {
    this.adapter = adapter;
    this.cacheService = cacheService;
    this.idGenerator = idGenerator;
  }

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

  async createImageFileLinks(catalog: string, numberOfLinks: number = 1): Promise<FileLink[]> {
    const fileLinks = <FileLink[]>[];

    for (let i = 0; i < numberOfLinks; i++) {
      const id = this.idGenerator.createUuid();
      const url = await this.adapter.generatePutSignedUrlForImage(catalog, id);

      fileLinks.push({ url, id });
    }

    return fileLinks;
  }

  async getAvatarFileLink(id: string, catalog: string): Promise<FileLink> {
    const url = await this.cacheService.getCache(id, catalog, async (expiresIn: number) =>
      this.adapter.getSignedGetUrl(expiresIn, FileType.AVATAR, catalog, id),
    );

    return { id, url };
  }

  async getImageLink(id: string, catalog: string): Promise<FileLink> {
    const url = await this.cacheService.getCache(id, catalog, async (expiresIn: number) => this.adapter.getImageUrl(expiresIn, id, catalog));

    return { id, url };
  }

  async getDocumentFileLink(id: string, catalog: string): Promise<FileLink> {
    const url = await this.adapter.getSignedGetUrl(3600, FileType.DOCUMENT, catalog, id);

    return { id, url };
  }
}
