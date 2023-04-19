import { InvestmentAccountsDatabase } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { Kysely } from 'kysely';

export async function up(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
  await db.schema
    .createTable('investment_accounts_profile_query')
    .addColumn('profileId', 'uuid', col => col.notNull().unique())
    .addColumn('data', 'json')
    .execute();

  await db.schema.createIndex('profileId').on('investment_accounts_profile_query').column('profileId').execute();
}

export async function down(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
  await db.schema.dropTable('investment_accounts_profile_query').execute();
}
