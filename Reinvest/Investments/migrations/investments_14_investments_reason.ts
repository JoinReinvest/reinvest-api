import { InvestmentsDatabase, investmentsTable, transactionEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema
    .alterTable(investmentsTable)
    .addColumn('reason', 'varchar(36)', col => col.defaultTo(null))
    .execute();

  await db.schema
    .alterTable(transactionEventsTable)
    .alterColumn('eventKind', col => col.setDataType('varchar(64)'))
    .execute();
}

export async function down(db: Kysely<InvestmentsDatabase>): Promise<void> {
  await db.schema
    .alterTable(transactionEventsTable)
    .alterColumn('eventKind', col => col.setDataType('varchar(36)'))
    .execute();
  await db.schema.alterTable(investmentsTable).dropColumn('reason').execute();
}
