import { DocumentsImageCacheRepository } from 'Documents/Adapter/Repository/DocumentsImageCacheRepository';
import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';

const DAYS_TO_EXPIRE = 30;

export type ImageCacheCreate = {
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

    const todayDate = DateTime.now();
    const isExpired = DateTime.from(cache.expirationDate).isBeforeOrEqual(todayDate);

    if (isExpired) {
      return null;
    }

    return cache.url;
  }

  private async createCache(url: string, catalog: string, fileName: string, expiresIn: number): Promise<boolean> {
    const isAlreadyCreated = await this.documentsImageCacheRepository.getCacheUrl(catalog, fileName);

    const expiresInSeconds = Math.round(expiresIn * 0.9); // 10% less than the expiration time
    const expirationDate = DateTime.from(new Date()).addSeconds(expiresInSeconds).toDate();

    if (isAlreadyCreated) {
      return this.documentsImageCacheRepository.update(expirationDate, url, catalog, fileName);
    }

    const id = this.idGenerator.createUuid();
    const imageCacheCreate: ImageCacheCreate = {
      id,
      catalog,
      expirationDate,
      fileName,
      url,
    };

    return this.documentsImageCacheRepository.create(imageCacheCreate);
  }

  async getCache(fileName: string, catalog: string, expiresIn: number, getUrlCallback: () => Promise<string>) {
    const imageUrl = await this.getUrl(catalog, fileName);

    if (imageUrl) {
      return imageUrl;
    }

    const url = await getUrlCallback();
    await this.createCache(url, catalog, fileName, expiresIn);

    return url;
  }
}
