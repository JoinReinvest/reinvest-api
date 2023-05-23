import { transactionEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema
    .createTable(transactionEventsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('investmentId', 'uuid', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('eventKind', 'varchar(36)', col => col.notNull()) // DIRECT/SCHEDULER
    .addColumn('eventStateJson', 'json', col => col.notNull())
    .execute();

  await db.schema.createIndex('transaction_investment_id').on(transactionEventsTable).column('investmentId').execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropIndex('transaction_investment_id').execute();
  await db.schema.dropTable(transactionEventsTable).execute();
}
