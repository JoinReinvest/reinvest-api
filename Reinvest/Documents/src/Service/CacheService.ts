import { DocumentsImageCacheRepository } from 'Documents/Adapter/Repository/DocumentsImageCacheRepository';
import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';

const DAYS_TO_EXPIRE = 6;

export type ImageCacheCreate = {
  bucketName: string;
  catalog: string;
  expirationDate: Date;
  fileName: string;
  id: UUID;
  url: string;
};

export class CacheService {
  private documentsImageCacheRepository: DocumentsImageCacheRepository;
  private idGenerator: IdGeneratorInterface;

  constructor(documentsImageCacheRepository: DocumentsImageCacheRepository, idGenerator: IdGeneratorInterface) {
    this.documentsImageCacheRepository = documentsImageCacheRepository;
    this.idGenerator = idGenerator;
  }

  public static getClassName = (): string => 'CacheService';

  private async getUrl(catalog: string, fileName: string) {
    const cache = await this.documentsImageCacheRepository.getCacheUrl(catalog, fileName);

    if (!cache) {
      return null;
    }

    const todayDate = DateTime.from(new Date());

    const isExpired = DateTime.from(cache.expirationDate).isBeforeOrEqual(todayDate);

    if (isExpired) {
      return null;
    }

    return cache.url;
  }

  private async createCache(url: string, catalog: string, bucketName: string, fileName: string): Promise<boolean> {
    const isAlreadyCreated = await this.documentsImageCacheRepository.getCacheUrl(catalog, fileName);

    const expirationDate = DateTime.from(new Date()).addDays(DAYS_TO_EXPIRE).toDate();

    if (isAlreadyCreated) {
      const status = await this.documentsImageCacheRepository.update(expirationDate, url);

      return status;
    }

    const id = this.idGenerator.createUuid();
    const imageCacheCreate: ImageCacheCreate = {
      id,
      catalog,
      expirationDate,
      fileName,
      url,
      bucketName,
    };

    const status = await this.documentsImageCacheRepository.create(imageCacheCreate);

    return status;
  }

  async getCache(fileName: string, catalog: string, getUrlCallback: (expiresIn: number) => Promise<string>) {
    const imageUrl = await this.getUrl(catalog, fileName);

    if (imageUrl) {
      return imageUrl;
    }

    const expiresIn = DAYS_TO_EXPIRE * 24 * 60 * 60; // DAYS_TO_EXPIRE * 24 hours * 60 minutes * 60 seconds

    const url = await getUrlCallback(expiresIn);

    await this.createCache(url, catalog, 'bucket', fileName);

    return url;
  }
}
