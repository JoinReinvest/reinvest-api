import { Kysely, sql } from 'kysely';
import { sadUnpaidFeesTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface UnpaidFeesTable {
 *   id: string;
 *   profileId: string;
 *   accountId: string;
 *   dividendId: string;
 *   assignedToDividendId: string | null;
 *   createdDate: Date;
 *   assignedDate: Date | null;
 *   feeToPay: number;
 *   status: 'AWAITING_ASSIGNMENT' | 'ASSIGNED';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadUnpaidFeesTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('dividendId', 'uuid', col => col.notNull())
    .addColumn('assignedToDividendId', 'uuid', col => col.defaultTo(null))
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('assignedDate', 'timestamp', col => col.defaultTo(null))
    .addColumn('feeToPay', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadUnpaidFeesTable).execute();
}
