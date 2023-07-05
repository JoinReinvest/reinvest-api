import { Kysely } from 'kysely';
import { sadFinancialOperationsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadFinancialOperationsTable)
    .addColumn('uniqueId', 'uuid', col => col.defaultTo(null).unique())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadFinancialOperationsTable).dropColumn('uniqueId').execute();
}
