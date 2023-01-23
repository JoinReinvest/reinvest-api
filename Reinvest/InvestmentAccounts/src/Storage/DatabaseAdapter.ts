import {AggregateTable} from "SimpleAggregator/Storage/Schema";
import {DatabaseProvider, PostgreSQLConfig} from "PostgreSQL/DatabaseProvider";
import {ProfileQueryTable} from "InvestmentAccounts/Storage/Queries/ProfileQuery";

export interface InvestmentAccountsDatabase {
    investment_accounts_profile_aggregate: AggregateTable,
    investment_accounts_profile_query: ProfileQueryTable,

}

export const DbProvider = (config: PostgreSQLConfig) => (new DatabaseProvider<InvestmentAccountsDatabase>(config));