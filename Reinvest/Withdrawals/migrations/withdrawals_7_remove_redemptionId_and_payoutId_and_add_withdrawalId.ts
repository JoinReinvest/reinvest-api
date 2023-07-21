import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .alterTable(withdrawalsFundsRequestsTable)
    .dropColumn('redemptionId')
    .dropColumn('payoutId')
    .addColumn('withdrawalId', 'uuid', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .alterTable(withdrawalsFundsRequestsTable)
    .addColumn('redemptionId', 'uuid', col => col.defaultTo(null))
    .addColumn('payoutId', 'uuid', col => col.defaultTo(null))
    .dropColumn('withdrawalId')
    .execute();
}
