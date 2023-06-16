import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsFundsRequestsAgreementsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .createTable(withdrawalsFundsRequestsAgreementsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('fundsRequestId', 'uuid', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('status', 'varchar(36)', col => col.notNull())

    .addColumn('signedByIP', 'varchar(36)', col => col.defaultTo(null))
    .addColumn('signedAt', 'timestamp', col => col.defaultTo(null))
    .addColumn('pdfDateCreated', 'timestamp', col => col.defaultTo(null))

    .addColumn('contentFieldsJson', 'json', col => col.notNull())
    .addColumn('templateVersion', 'integer', col => col.defaultTo(1))
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema.dropTable(withdrawalsFundsRequestsAgreementsTable).execute();
}
