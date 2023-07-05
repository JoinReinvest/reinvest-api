import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { tradesTable, TradingDatabase } from 'Trading/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema
    .alterTable(tradesTable)
    .addColumn('cancelTradeJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(tradesTable).dropColumn('cancelTradeJson').execute();
}
