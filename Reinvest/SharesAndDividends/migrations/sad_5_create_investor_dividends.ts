import { Kysely, sql } from 'kysely';
import { sadInvestorDividendsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

/**
 * export interface InvestorDividendsTable {
 *   id: string;
 *   profileId: string;
 *   accountId: string;
 *   distributionId: string;
 *   calculatedDividendsList: JSONObject;
 *   createdDate: Date;
 *   actionDate: Date | null;
 *   dividendAmount: number;
 *   totalDividendAmount: number;
 *   totalFeeAmount: number;
 *   status: 'AWAITING_ACTION' | 'REINVESTED' | 'WITHDRAWN' | 'ZEROED';
 * }
 */

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .createTable(sadInvestorDividendsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('distributionId', 'uuid', col => col.notNull())
    .addColumn('calculatedDividends', 'json', col => col.notNull())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('actionDate', 'timestamp', col => col.defaultTo(null))
    .addColumn('dividendAmount', 'integer', col => col.notNull())
    .addColumn('totalDividendAmount', 'integer', col => col.notNull())
    .addColumn('totalFeeAmount', 'integer', col => col.notNull())
    .addColumn('status', 'varchar(36)', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.dropTable(sadInvestorDividendsTable).execute();
}
