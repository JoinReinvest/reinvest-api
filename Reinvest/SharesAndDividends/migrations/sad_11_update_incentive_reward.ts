import { Kysely } from 'kysely';
import { sadInvestorIncentiveDividendTable, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema
    .alterTable(sadInvestorIncentiveDividendTable)
    .alterColumn('accountId', col => col.dropNotNull())
    .addColumn('rewardType', 'varchar(36)', col => col.notNull())
    .addColumn('theOtherProfileId', 'uuid', col => col.notNull())
    .execute();

  await db.schema
    .alterTable(sadInvestorIncentiveDividendTable)
    .addUniqueConstraint('unique_incentive_reward', ['profileId', 'theOtherProfileId', 'rewardType'])
    .execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadInvestorIncentiveDividendTable).dropConstraint('unique_incentive_reward').execute();
  await db.schema.alterTable(sadInvestorIncentiveDividendTable).dropColumn('rewardType').dropColumn('theOtherProfileId').execute();
}
