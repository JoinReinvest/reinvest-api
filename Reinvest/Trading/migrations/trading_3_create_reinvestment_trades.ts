import { Kysely, sql } from 'kysely';
import { reinvestmentTradesTable, TradingDatabase } from 'Trading/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema
    .createTable(reinvestmentTradesTable)
    .addColumn('dividendId', 'uuid', col => col.primaryKey())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('tradeConfigurationJson', 'json', col => col.notNull())
    .addColumn('vendorsConfigurationJson', 'json', col => col.defaultTo(null))
    .addColumn('vertaloDistributionStateJson', 'json', col => col.defaultTo(null))
    .addColumn('sharesTransferJson', 'json', col => col.defaultTo(null))
    .addColumn('vertaloPaymentJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema.dropTable(reinvestmentTradesTable).execute();
}
