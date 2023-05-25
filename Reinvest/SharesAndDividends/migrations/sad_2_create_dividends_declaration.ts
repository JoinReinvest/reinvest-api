import { Kysely, sql } from 'kysely';
import { sadDividendsDeclarationsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface DividendsDeclarationTable {
 *   id: string;
 *   calculatedFromDate: Date;
 *   calculatedToDate: Date;
 *   createdDate: Date;
 *   numberOfDays: number;
 *   numberOfShares: number;
 *   unitAmountPerSharePerDay: number;
 *   totalDividendAmount: number;
 *   status: 'CALCULATING' | 'CALCULATED';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadDividendsDeclarationsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('calculatedFromDate', 'timestamp', col => col.notNull())
    .addColumn('calculatedToDate', 'timestamp', col => col.notNull())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('numberOfDays', 'integer', col => col.notNull())
    .addColumn('numberOfShares', 'float8', col => col.notNull())
    .addColumn('unitAmountPerSharePerDay', 'integer', col => col.notNull())
    .addColumn('totalDividendAmount', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadDividendsDeclarationsTable).execute();
}
