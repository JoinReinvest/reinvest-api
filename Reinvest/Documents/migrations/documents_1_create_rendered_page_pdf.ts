import { DocumentsDatabase, documentsRenderedPagePdfTable } from 'Documents/Adapter/Database/DatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<DocumentsDatabase>): Promise<void> {
    await db.schema
        .createTable(documentsRenderedPagePdfTable)
        .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
        .addColumn('profileId', 'uuid', col => col.notNull())
        .addColumn('url', 'text', col => col.notNull())
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
        .addColumn('dateGenerated', 'timestamp', col => col.defaultTo(null))
        .execute();
}

export async function down(db: Kysely<DocumentsDatabase>): Promise<void> {
    await db.schema.dropTable(documentsRenderedPagePdfTable).execute();
}
