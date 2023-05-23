import { investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(investmentsTable)
    .addColumn('bankAccountId', 'uuid', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsTable).dropColumn('bankAccountId').execute();
}
