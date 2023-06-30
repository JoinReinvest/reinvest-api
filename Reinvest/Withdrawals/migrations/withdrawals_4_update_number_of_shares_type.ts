import { Kysely } from 'kysely';
import { WithdrawalsDatabase, withdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .alterTable(withdrawalsFundsRequestsTable)
    .alterColumn('numberOfShares', col => col.setDataType('float8'))
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {}
