import {Kysely} from 'kysely';
import {InvestmentAccountsDatabase} from "InvestmentAccounts/Storage/DatabaseAdapter";

export async function up(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
    await db.schema
        .createTable('investment_accounts_profile_query')
        .addColumn('profileId', 'varchar(36)', col => col.notNull().unique())
        .addColumn('userId', 'varchar(255)', col => col.notNull())
        .addColumn('data', 'json')
        .execute();

    await db.schema.createIndex('profileId').on('investment_accounts_profile_query').column('profileId').execute();
    await db.schema.createIndex('userId').on('investment_accounts_profile_query').column('userId').execute();
}

export async function down(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
    await db.schema.dropTable('investment_accounts_profile_query').execute();
}
