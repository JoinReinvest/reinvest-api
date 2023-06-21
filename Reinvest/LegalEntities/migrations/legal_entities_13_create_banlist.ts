import { Kysely, sql } from 'kysely';
import { legalEntitiesBannedListTable, LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(legalEntitiesBannedListTable)
    .addColumn('profileId', 'uuid', col => col.primaryKey())
    .addColumn('accountId', 'uuid', col => col.defaultTo(null))
    .addColumn('stakeholderId', 'uuid', col => col.defaultTo(null))
    .addColumn('type', 'varchar(36)', col => col.notNull())
    .addColumn('reasons', 'text', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateCancelled', 'timestamp', col => col.defaultTo(null))
    .addColumn('sensitiveNumber', 'varchar(255)', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(legalEntitiesBannedListTable).execute();
}
