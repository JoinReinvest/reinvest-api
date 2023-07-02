import { Kysely } from 'kysely/dist/esm';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

import { DocumentsRenderedPagePdfSchema } from './types';

export const documentsRenderedPagePdfTable = 'documents_rendered_page_pdf_table';
export interface DocumentsDatabase {
  // investment_accounts_profile_aggregate: AggregateTable,
  // investment_accounts_profile_query: ProfileQueryTable,
  [documentsRenderedPagePdfTable]: DocumentsRenderedPagePdfSchema;
}

export const DatabaseAdapterInstance = 'DatabaseAdapter';
export type DatabaseAdapter = Kysely<DocumentsDatabase>;
export type DocumentsDatabaseAdapterProvider = DatabaseProvider<DocumentsDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): DocumentsDatabaseAdapterProvider {
  return new DatabaseProvider<DocumentsDatabase>(config);
}
