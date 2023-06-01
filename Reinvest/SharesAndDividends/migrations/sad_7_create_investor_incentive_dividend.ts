import { Kysely, sql } from 'kysely';
import { sadInvestorIncentiveDividendTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface InvestorIncentiveDividendTable {
 *   id: string;
 *   profileId: string;
 *   accountId: string;
 *   createdDate: Date;
 *   actionDate: Date | null;
 *   amount: number;
 *   status: 'AWAITING_ACTION' | 'REINVESTED' | 'WITHDRAWN';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadInvestorIncentiveDividendTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('actionDate', 'timestamp', col => col.defaultTo(null))
    .addColumn('amount', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadInvestorIncentiveDividendTable).execute();
}
