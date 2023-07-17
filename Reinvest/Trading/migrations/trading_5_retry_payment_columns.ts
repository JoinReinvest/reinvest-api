import { Kysely } from 'kysely';
import { tradesTable, TradingDatabase } from 'Trading/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema
    .alterTable(tradesTable)
    .addColumn('retryPaymentStateJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema.alterTable(tradesTable).dropColumn('retryPaymentStateJson').execute();
}
