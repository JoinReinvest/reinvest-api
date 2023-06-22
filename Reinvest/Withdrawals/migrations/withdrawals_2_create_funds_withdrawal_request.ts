import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .createTable(withdrawalsFundsRequestsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())

    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateDecision', 'timestamp', col => col.defaultTo(null))

    .addColumn('redemptionId', 'uuid', col => col.defaultTo(null))
    .addColumn('payoutId', 'uuid', col => col.defaultTo(null))
    .addColumn('agreementId', 'uuid', col => col.defaultTo(null))

    .addColumn('accountValue', 'integer', col => col.notNull())
    .addColumn('totalFunds', 'integer', col => col.notNull())
    .addColumn('totalDividends', 'integer', col => col.notNull())
    .addColumn('totalFee', 'integer', col => col.notNull())
    .addColumn('eligibleFunds', 'integer', col => col.notNull())
    .addColumn('numberOfShares', 'integer', col => col.notNull())

    .addColumn('investorWithdrawalReason', 'text', col => col.defaultTo(null))
    .addColumn('adminDecisionReason', 'text', col => col.defaultTo(null))

    .addColumn('status', 'varchar(36)', col => col.notNull())
    .addColumn('sharesJson', 'json', col => col.notNull())
    .addColumn('dividendsJson', 'json', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema.dropTable(withdrawalsFundsRequestsTable).execute();
}
