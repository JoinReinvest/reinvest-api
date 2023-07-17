import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { updatesTable } from 'Portfolio/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(updatesTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('portfolioId', 'uuid', col => col.notNull())
    .addColumn('title', 'varchar(255)', col => col.notNull())
    .addColumn('body', 'varchar(255)')
    .addColumn('image', 'json', col => col.defaultTo(null))
    .addColumn('createdAt', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(updatesTable).execute();
}
