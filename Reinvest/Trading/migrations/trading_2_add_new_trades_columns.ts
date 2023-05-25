import { Kysely } from 'kysely';
import { LegalEntitiesDatabase } from 'LegalEntities/Adapter/Database/DatabaseAdapter';
import { tradesTable, TradingDatabase } from 'Trading/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<TradingDatabase>): Promise<void> {
  await db.schema
    .alterTable(tradesTable)
    .addColumn('disbursementJson', 'json', col => col.defaultTo(null))
    .addColumn('sharesTransferJson', 'json', col => col.defaultTo(null))
    .addColumn('vertaloPaymentJson', 'json', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<LegalEntitiesDatabase>): Promise<void> {
  await db.schema.alterTable(tradesTable).dropColumn('disbursementJson').dropColumn('sharesTransferJson').dropColumn('vertaloPaymentJson').execute();
}
