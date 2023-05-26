import { Kysely, sql } from 'kysely';
import { sadGlobalFinancialOperationsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface GlobalFinancialOperationsTable {
 *   id: string;
 *   createdDate: Date;
 *   operationType: 'NAV_CHANGED';
 *   dataJson: JSONObject;
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadGlobalFinancialOperationsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('operationType', 'varchar(36)', col => col.notNull())
    .addColumn('dataJson', 'json', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadGlobalFinancialOperationsTable).execute();
}
