import { Kysely } from 'kysely/dist/esm';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const archivingRenderedPagePdfTable = 'archiving_rendered_page_pdf_table';

export interface ArchivingDatabase {
  // [archivingRenderedPagePdfTable]: ArchivingRenderedPagePdfSchema;
}

export const ArchivingDatabaseAdapterInstance = 'ArchivingDatabaseAdapter';
export type DatabaseAdapter = Kysely<ArchivingDatabase>;
export type ArchivingDatabaseAdapterProvider = DatabaseProvider<ArchivingDatabase>;

export function DatabaseAdapterProvider(config: PostgreSQLConfig): ArchivingDatabaseAdapterProvider {
  return new DatabaseProvider<ArchivingDatabase>(config);
}
