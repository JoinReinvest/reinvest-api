import { InvestmentsDatabase, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsTable).renameColumn('scheduledBy', 'origin').execute();
  await db.schema.alterTable(investmentsTable).renameColumn('recurringInvestmentId', 'originId').execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsTable).renameColumn('origin', 'scheduledBy').execute();
  await db.schema.alterTable(investmentsTable).renameColumn('originId', 'recurringInvestmentId').execute();
}
