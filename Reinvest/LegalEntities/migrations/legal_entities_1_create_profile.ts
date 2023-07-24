import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase, legalEntitiesProfileTable } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(legalEntitiesProfileTable)
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('profileId', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('externalId', 'varchar(36)', col => col.notNull().unique())
    .addColumn('label', 'varchar(36)', col => col.notNull())
    .addColumn('name', 'json', col => col.defaultTo(null))
    .addColumn('ssn', 'varchar(11)', col => col.defaultTo(null).unique())
    .addColumn('dateOfBirth', 'json', col => col.defaultTo(null))
    .addColumn('address', 'json', col => col.defaultTo(null))
    .addColumn('idScan', 'json', col => col.defaultTo(null))
    .addColumn('avatar', 'json', col => col.defaultTo(null))
    .addColumn('domicile', 'json', col => col.defaultTo(null))
    .addColumn('statements', 'json', col => col.defaultTo(null))
    .addColumn('isCompleted', 'boolean', col => col.defaultTo(false))
    .execute();

  await db.schema.createIndex('legal_entities_ssn_index').on('legal_entities_profile').column('ssn').execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropIndex('legal_entities_ssn_index').execute();
  await db.schema.dropTable(legalEntitiesProfileTable).execute();
}
