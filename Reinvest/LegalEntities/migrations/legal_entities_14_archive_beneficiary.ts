import { Kysely } from 'kysely';
import { legalEntitiesBeneficiaryTable, LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(legalEntitiesBeneficiaryTable)
    .addColumn('isArchived', 'boolean', col => col.defaultTo(false))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(legalEntitiesBeneficiaryTable).dropColumn('isArchived').execute();
}
