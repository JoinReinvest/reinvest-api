import { Kysely } from 'kysely';
import { legalEntitiesCompanyAccountTable, LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(legalEntitiesCompanyAccountTable)
    .addColumn('einHash', 'varchar(255)', col => col.unique())
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(legalEntitiesCompanyAccountTable).dropColumn('einHash').execute();
}
