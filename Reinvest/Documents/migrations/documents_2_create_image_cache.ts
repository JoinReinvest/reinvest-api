import { DocumentsDatabase, documentsImageCacheTable } from 'Documents/Adapter/Database/DatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<DocumentsDatabase>): Promise<void> {
  await db.schema
    .createTable(documentsImageCacheTable)
    .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('catalog', 'text', col => col.notNull())
    .addColumn('url', 'text', col => col.notNull())
    .addColumn('fileName', 'text', col => col.notNull())
    .addColumn('bucketName', 'text', col => col.notNull())
    .addColumn('expirationDate', 'timestamp', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<DocumentsDatabase>): Promise<void> {
  await db.schema.dropTable(documentsImageCacheTable).execute();
}
