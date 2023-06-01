import { InvestmentsDatabase, reinvestmentEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema
    .createTable(reinvestmentEventsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('dividendId', 'uuid', col => col.notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('eventKind', 'varchar(36)', col => col.notNull())
    .addColumn('eventStateJson', 'json', col => col.notNull())
    .execute();

  await db.schema.createIndex('reinvestment_dividend_id').on(reinvestmentEventsTable).column('dividendId').execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema.dropIndex('reinvestment_dividend_id').execute();
  await db.schema.dropTable(reinvestmentEventsTable).execute();
}
