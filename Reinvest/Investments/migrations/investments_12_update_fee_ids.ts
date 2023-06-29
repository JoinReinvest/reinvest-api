import { InvestmentsDatabase, investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsFeesTable).dropColumn('verificationFeeId').execute();
  await db.schema
    .alterTable(investmentsFeesTable)
    .alterColumn('approvedByIP', col => col.dropNotNull())
    .addColumn('verificationFeeIdsJson', 'json', col => col.defaultTo(null))
    .addColumn('abortedDate', 'timestamp', col => col.defaultTo(null))
    .execute();

  await db.schema.alterTable(investmentsFeesTable).addUniqueConstraint('unique_investment_id', ['investmentId']).execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsFeesTable).dropConstraint('unique_investment_id').execute();
  await db.schema.alterTable(investmentsFeesTable).dropColumn('verificationFeeIdsJson').dropColumn('abortedDate').execute();
  await db.schema
    .alterTable(investmentsFeesTable)
    .addColumn('verificationFeeId', 'uuid', col => col.defaultTo(null))
    .execute();
}
