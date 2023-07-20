import { DocumentsDatabaseAdapterProvider, documentsImageCacheTable } from 'Documents/Adapter/Database/DatabaseAdapter';
import { ImageCacheCreate } from 'Documents/Service/CacheService';

export class DocumentsImageCacheRepository {
  public static getClassName = (): string => 'DocumentsImageCacheRepository';

  private documentsDatabaseAdapterProvider: DocumentsDatabaseAdapterProvider;

  constructor(documentsDatabaseAdapterProvider: DocumentsDatabaseAdapterProvider) {
    this.documentsDatabaseAdapterProvider = documentsDatabaseAdapterProvider;
  }

  async create(imageCacheCreate: ImageCacheCreate) {
    try {
      await this.documentsDatabaseAdapterProvider
        .provide()
        .insertInto(documentsImageCacheTable)
        .values({
          ...imageCacheCreate,
        })
        .execute();

      return true;
    } catch (err: any) {
      return false;
    }
  }

  async update(expirationDate: Date, url: string) {
    try {
      await this.documentsDatabaseAdapterProvider
        .provide()
        .updateTable(documentsImageCacheTable)
        .set({
          expirationDate,
          url,
        })
        .execute();

      return true;
    } catch (err: any) {
      return false;
    }
  }

  async getCacheUrl(catalog: string, fileName: string) {
    try {
      const cache = await this.documentsDatabaseAdapterProvider
        .provide()
        .selectFrom(documentsImageCacheTable)
        .selectAll()
        .where('catalog', '=', catalog)
        .where('fileName', '=', fileName)
        .executeTakeFirst();

      if (!cache) {
        return false;
      }

      return { url: cache.url, expirationDate: cache.expirationDate };
    } catch (err: any) {
      return false;
    }
  }
}
