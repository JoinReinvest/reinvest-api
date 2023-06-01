import { Kysely, sql } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { tradesTable, TradingDatabase } from 'Trading/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema
    .createTable(tradesTable)
    .addColumn('investmentId', 'uuid', col => col.primaryKey())
    .addColumn('createdDate', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('tradeConfigurationJson', 'json', col => col.notNull())
    .addColumn('vendorsConfigurationJson', 'json', col => col.defaultTo(null))
    .addColumn('northCapitalTradeStateJson', 'json', col => col.defaultTo(null))
    .addColumn('vertaloDistributionStateJson', 'json', col => col.defaultTo(null))
    .addColumn('subscriptionAgreementStateJson', 'json', col => col.defaultTo(null))
    .addColumn('fundsMoveStateJson', 'json', col => col.defaultTo(null))
    .addColumn('tradeId', 'varchar(36)', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.dropTable(tradesTable).execute();
}
