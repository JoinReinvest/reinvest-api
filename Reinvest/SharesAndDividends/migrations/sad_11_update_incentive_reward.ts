import { Kysely } from 'kysely';
import { sadInvestorIncentiveDividendTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadInvestorIncentiveDividendTable)
    .alterColumn('accountId', col => col.dropNotNull())
    .execute();

  await db.schema.alterTable(sadInvestorIncentiveDividendTable).addUniqueConstraint('profile_id_unique', ['profileId']).execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadInvestorIncentiveDividendTable).dropConstraint('profile_id_unique').execute();
}
