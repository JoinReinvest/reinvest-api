import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { northCapitalSynchronizationTable } from 'Registration/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(northCapitalSynchronizationTable)
    .addColumn('links', 'json', col => col.notNull().defaultTo('[]'))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(northCapitalSynchronizationTable).dropColumn('links').execute();
}
