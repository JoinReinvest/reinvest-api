import { Kysely, sql } from 'kysely';
import { legalEntitiesCompanyAccountTable, LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(legalEntitiesCompanyAccountTable)
    .addColumn('initialsValue', 'integer', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(legalEntitiesCompanyAccountTable).dropColumn('initialsValue').execute();
}
