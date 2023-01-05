import {AggregateTable} from "SimpleAggregator/Storage/Schema";
import {DatabaseProvider} from "PostgreSQL/DatabaseProvider";
import {ProfileQueryTable} from "InvestmentAccounts/Storage/Queries/ProfileQuery";

export interface InvestmentAccountsDatabase {
    investment_accounts_profile_aggregate: AggregateTable,
    investment_accounts_profile_query: ProfileQueryTable,

}
export const DbProvider = new DatabaseProvider<InvestmentAccountsDatabase>({
    host: 'localhost',
    database: 'lukaszd_staging_db',
    user: 'executive',
    password: 'password'
});