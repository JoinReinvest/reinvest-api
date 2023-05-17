import { InvestmentAccountsDatabase } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
  await db.schema
    .createTable('investment_accounts_configuration')
    .addColumn('id', 'uuid', col => col.primaryKey().notNull())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateUpdated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('accountId', 'uuid', col => col.notNull())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('configType', 'varchar(255)', col => col.notNull())
    .addColumn('configValueJson', 'json', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
  await db.schema.dropTable('investment_accounts_configuration').execute();
}
