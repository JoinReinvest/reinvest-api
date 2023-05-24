import { investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(investmentsTable)
    .addColumn('tradeId', 'varchar(36)', col => col.notNull())
    .addColumn('dateStarted', 'timestamp', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsTable).dropColumn('tradeId').execute();
  await db.schema.alterTable(investmentsTable).dropColumn('dateStarted').execute();
}
