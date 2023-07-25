import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .createTable(withdrawalsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('status', 'varchar(36)', col => col.notNull())

    .addColumn('redemptionId', 'uuid', col => col.notNull())
    .addColumn('payoutId', 'uuid', col => col.notNull())

    .addColumn('listOfWithdrawalsJson', 'json', col => col.notNull())
    .addColumn('listOfDividendsJson', 'json', col => col.notNull())

    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateCompleted', 'timestamp', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema.dropTable(withdrawalsTable).execute();
}
