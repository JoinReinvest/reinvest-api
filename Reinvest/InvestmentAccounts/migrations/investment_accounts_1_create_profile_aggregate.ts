import {Kysely} from 'kysely';
import {InvestmentAccountsDatabase} from "InvestmentAccounts/Storage/DatabaseAdapter";

export async function up(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
    await db.schema
        .createTable('investment_accounts_profile_aggregate')
        .addColumn('aggregateId', 'varchar(36)', col => col.primaryKey().notNull().unique())
        .addColumn('dateCreated', 'date', col => col.notNull())
        .addColumn('version', 'int8', col => col.notNull())
        .addColumn('previousVersion', 'int8', col => col.notNull())
        .addColumn('kind', 'varchar(36)', col => col.notNull())
        .addColumn('state', 'json')
        .execute();
}

export async function down(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
    await db.schema.dropTable('investment_accounts_profile_aggregate').execute();
}
