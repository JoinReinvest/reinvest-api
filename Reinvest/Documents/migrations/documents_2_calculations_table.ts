import { calculationsTable, DocumentsDatabase } from 'Documents/Adapter/Database/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<DocumentsDatabase>): Promise<void> {
  await db.schema
    .createTable(calculationsTable)
    .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('data', 'json', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<DocumentsDatabase>): Promise<void> {
  await db.schema.dropTable(calculationsTable).execute();
}
