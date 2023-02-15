import {AggregateTable} from "SimpleAggregator/Storage/Schema";
import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {ProfileQueryTable} from "InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery";

export interface InvestmentAccountsDatabase {
    investment_accounts_profile_aggregate: AggregateTable,
    investment_accounts_profile_query: ProfileQueryTable,
}

export const investmentAccountsDatabaseProviderName = 'DatabaseProviderInvestmentAccountsDatabase';
export type InvestmentAccountDbProvider = DatabaseProvider<InvestmentAccountsDatabase>;

export function createInvestmentAccountsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentAccountDbProvider {
    return new DatabaseProvider<InvestmentAccountsDatabase>(config);
}