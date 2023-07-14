import { Kysely } from 'kysely';
import { sadAccountsConfiguration, SharesAndDividendsDatabase } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable('investment_accounts_configuration').renameTo(sadAccountsConfiguration).execute();
}

export async function down(db: Kysely<SharesAndDividendsDatabase>): Promise<void> {
  await db.schema.alterTable(sadAccountsConfiguration).renameTo('investment_accounts_configuration').execute();
}
