import { InvestmentsDatabase, investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsFeesTable).dropColumn('verificationFeeId').execute();
  await db.schema
    .alterTable(investmentsFeesTable)
    .addColumn('verificationFeeIdsJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.alterTable(investmentsFeesTable).dropColumn('verificationFeeIdsJson').execute();
  await db.schema
    .alterTable(investmentsFeesTable)
    .addColumn('verificationFeeId', 'uuid', col => col.defaultTo(null))
    .execute();
}
