import { Kysely, sql } from 'kysely';
import { legalEntitiesBeneficiaryTable, LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(legalEntitiesBeneficiaryTable)
    .addColumn('accountId', 'uuid', col => col.notNull().primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('individualId', 'uuid', col => col.notNull())
    .addColumn('nameJson', 'json', col => col.notNull())
    .addColumn('avatarJson', 'json', col => col.defaultTo(null))
    .addColumn('label', 'varchar(255)', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(legalEntitiesBeneficiaryTable).execute();
}
