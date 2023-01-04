import {AggregateTable} from "SimpleAggregator/Storage/Schema";
import {DatabaseProvider} from "PostgreSQL/DatabaseProvider";

export interface InvestmentAccountsDatabase {
    investment_accounts_profile_aggregate: AggregateTable,

}
export const DbProvider = new DatabaseProvider<InvestmentAccountsDatabase>({
    host: 'localhost',
    database: 'lukaszd_staging_db',
    user: 'executive',
    password: 'password'
});