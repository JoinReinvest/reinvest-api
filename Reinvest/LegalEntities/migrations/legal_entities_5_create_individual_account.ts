import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase, legalEntitiesIndividualAccountTable } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(legalEntitiesIndividualAccountTable)
    .addColumn('accountId', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('employmentStatus', 'json', col => col.defaultTo(null))
    .addColumn('employer', 'json', col => col.defaultTo(null))
    .addColumn('netWorth', 'json', col => col.defaultTo(null))
    .addColumn('netIncome', 'json', col => col.defaultTo(null))
    .addColumn('avatar', 'json', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(legalEntitiesIndividualAccountTable).execute();
}
