import { recurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .alterTable(recurringInvestmentsTable)
    .addColumn('nextDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(recurringInvestmentsTable).dropColumn('nextDate').execute();
}
