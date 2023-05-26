import { Kysely, sql } from 'kysely';
import { sadCalculatedDividendsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface CalculatedDividendsTable {
 *   id: string;
 *   profileId: string;
 *   accountId: string;
 *   declarationId: string;
 *   sharesId: string;
 *   calculationDate: Date;
 *   dividendAmount: number;
 *   feeAmount: number;
 *   status: 'AWAITING_DISTRIBUTION' | 'DISTRIBUTED' | 'LOCKED' | 'REVOKED';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadCalculatedDividendsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('declarationId', 'uuid', col => col.notNull())
    .addColumn('sharesId', 'uuid', col => col.notNull())
    .addColumn('calculationDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dividendAmount', 'integer', col => col.notNull())
    .addColumn('feeAmount', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadCalculatedDividendsTable).execute();
}
