import { Kysely, sql } from 'kysely';
import { WithdrawalsDatabase, withdrawalsDocumentsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema
    .createTable(withdrawalsDocumentsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .addColumn('type', 'varchar(36)', col => col.notNull())

    .addColumn('pdfDateCreated', 'timestamp', col => col.defaultTo(null))
    .addColumn('contentFieldsJson', 'json', col => col.notNull())
    .addColumn('templateVersion', 'integer', col => col.defaultTo(1))

    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateRedeemed', 'timestamp', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<WithdrawalsDatabase>): Promise<void> {
  await db.schema.dropTable(withdrawalsDocumentsTable).execute();
}
