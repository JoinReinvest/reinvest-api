import { Kysely } from 'kysely';
import { sadInvestorDividendsTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadInvestorDividendsTable)
    .addColumn('transferredId', 'uuid', col => col.defaultTo(null))
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadInvestorDividendsTable).dropColumn('transferredId').execute();
}
