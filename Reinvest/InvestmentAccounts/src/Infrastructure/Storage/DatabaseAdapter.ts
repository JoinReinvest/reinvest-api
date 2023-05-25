import { AccountConfiguration } from 'InvestmentAccounts/Domain/Configuration/AccountConfiguration';
import { ProfileQueryTable } from 'InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { AggregateTable } from 'SimpleAggregator/Storage/Schema';

export const investmentAccountConfiguration = 'investment_accounts_configuration';
export const investmentAccountsProfileAggregate = 'investment_accounts_profile_aggregate';
export const investmentAccountsProfileQuery = 'investment_accounts_profile_query';
export interface InvestmentAccountsDatabase {
  [investmentAccountConfiguration]: AccountConfiguration;
  [investmentAccountsProfileAggregate]: AggregateTable;
  [investmentAccountsProfileQuery]: ProfileQueryTable;
}

export const investmentAccountsDatabaseProviderName = 'DatabaseProviderInvestmentAccountsDatabase';
export type InvestmentAccountDbProvider = DatabaseProvider<InvestmentAccountsDatabase>;

export function createInvestmentAccountsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentAccountDbProvider {
  return new DatabaseProvider<InvestmentAccountsDatabase>(config);
}
