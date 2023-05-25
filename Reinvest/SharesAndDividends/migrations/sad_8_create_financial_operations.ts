import { Kysely, sql } from 'kysely';
import { sadFinancialOperationsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface FinancialOperationsTable {
 *   id: string;
 *   profileId: string;
 *   accountId: string;
 *   createdDate: Date;
 *   operationType: 'INVESTMENT' | 'REINVESTMENT' | 'WITHDRAWAL' | 'REVOKED';
 *   dataJson: JSONObject;
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadFinancialOperationsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('operationType', 'varchar(36)', col => col.notNull())
    .addColumn('dataJson', 'json', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadFinancialOperationsTable).execute();
}
