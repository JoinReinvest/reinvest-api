import { Kysely } from 'kysely/dist/esm';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

import { DocumentsImageCacheSchema, DocumentsRenderedPagePdfSchema } from './types';

export const documentsRenderedPagePdfTable = 'documents_rendered_page_pdf_table';
export const documentsImageCacheTable = 'documents_image_cache_table';

export interface DocumentsDatabase {
  [documentsImageCacheTable]: DocumentsImageCacheSchema;
  [documentsRenderedPagePdfTable]: DocumentsRenderedPagePdfSchema;
}

export const DocumentsDatabaseAdapterInstance = 'DocumentsDatabaseAdapter';
export type DatabaseAdapter = Kysely<DocumentsDatabase>;
export type DocumentsDatabaseAdapterProvider = DatabaseProvider<DocumentsDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): DocumentsDatabaseAdapterProvider {
  return new DatabaseProvider<DocumentsDatabase>(config);
}
