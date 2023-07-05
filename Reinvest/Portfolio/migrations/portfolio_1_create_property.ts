import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { propertyTable } from 'Portfolio/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(propertyTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('portfolioId', 'uuid', col => col.notNull())
    .addColumn('dealpathJson', 'json', col => col.notNull())
    .addColumn('adminJson', 'json', col => col.notNull())
    .addColumn('dataJson', 'json', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .addColumn('lastUpdate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(propertyTable).execute();
}
