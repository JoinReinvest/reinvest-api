import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsDividendsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .createTable(withdrawalsDividendsRequestsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('dividendId', 'uuid', col => col.notNull().unique())
    .addColumn('payoutId', 'uuid', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateDecided', 'timestamp', col => col.defaultTo(null))
    .addColumn('eligibleAmount', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema.dropTable(withdrawalsDividendsRequestsTable).execute();
}
