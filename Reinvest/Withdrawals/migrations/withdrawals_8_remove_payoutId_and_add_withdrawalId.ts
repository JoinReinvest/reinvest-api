import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsDividendsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .alterTable(withdrawalsDividendsRequestsTable)
    .dropColumn('payoutId')
    .addColumn('withdrawalId', 'uuid', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .alterTable(withdrawalsDividendsRequestsTable)
    .addColumn('payoutId', 'uuid', col => col.defaultTo(null))
    .dropColumn('withdrawalId')
    .execute();
}
