import { InvestmentAccountsDatabase } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
  await db.schema
    .createTable('investment_accounts_configuration')
    .addColumn('id', 'uuid', col => col.primaryKey().notNull().unique())
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateUpdated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('accountId', 'uuid', col => col.notNull().unique())
    .addColumn('profileId', 'uuid', col => col.notNull().unique())
    .addColumn('configType', 'varchar(255)', col => col.notNull().defaultTo('AUTOMATIC_DIVIDEND_REINVESTMENT_OPT_IN_OUT'))
    .addColumn('configValueJson', 'json', col => col.notNull())
    .execute();

  await db.schema.createIndex('id').on('investment_accounts_configuration').column('id').execute();
}

export async function down(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
  await db.schema.dropTable('investment_accounts_configuration').execute();
}
