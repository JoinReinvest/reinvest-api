import { ProfileQueryTable } from 'InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { AggregateTable } from 'SimpleAggregator/Storage/Schema';

export const investmentAccountsProfileAggregate = 'investment_accounts_profile_aggregate';
export const investmentAccountsProfileQuery = 'investment_accounts_profile_query';

export interface InvestmentAccountsDatabase {
  [investmentAccountsProfileAggregate]: AggregateTable;
  [investmentAccountsProfileQuery]: ProfileQueryTable;
}

export const investmentAccountsDatabaseProviderName = 'DatabaseProviderInvestmentAccountsDatabase';
export type InvestmentAccountDbProvider = DatabaseProvider<InvestmentAccountsDatabase>;

export function createInvestmentAccountsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentAccountDbProvider {
  return new DatabaseProvider<InvestmentAccountsDatabase>(config);
}
