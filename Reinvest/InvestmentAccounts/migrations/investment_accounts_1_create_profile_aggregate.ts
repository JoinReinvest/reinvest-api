import {Kysely} from 'kysely';
import {InvestmentAccountsDatabase} from "InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter";
import {createAggregateTable} from "SimpleAggregator/Storage/KyselyMigrationAggregateTable";

export async function up(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
    await createAggregateTable<InvestmentAccountsDatabase>(db, 'investment_accounts_profile_aggregate');
}

export async function down(db: Kysely<InvestmentAccountsDatabase>): Promise<void> {
    await db.schema.dropTable('investment_accounts_profile_aggregate').execute();
}
