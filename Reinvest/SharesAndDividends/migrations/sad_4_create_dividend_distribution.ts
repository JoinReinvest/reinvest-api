import { Kysely } from 'kysely';
import { sadDividendDistributionTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface DividendDistributionTable {
 *   id: string;
 *   distributeToDate: Date;
 *   status: 'DISTRIBUTING' | 'DISTRIBUTED';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadDividendDistributionTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('distributeToDate', 'timestamp', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadDividendDistributionTable).execute();
}
