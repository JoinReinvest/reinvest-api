import { ProfileQueryTable } from 'InvestmentAccounts/Infrastructure/Storage/Queries/ProfileQuery';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { AggregateTable } from 'SimpleAggregator/Storage/Schema';

import { AccountConfiguration } from '../../Domain/Configuration/AccountConfiguration';

export interface InvestmentAccountsDatabase {
  investment_account_configuration: AccountConfiguration;
  investment_accounts_profile_aggregate: AggregateTable;
  investment_accounts_profile_query: ProfileQueryTable;
}

export const investmentAccountsDatabaseProviderName = 'DatabaseProviderInvestmentAccountsDatabase';
export type InvestmentAccountDbProvider = DatabaseProvider<InvestmentAccountsDatabase>;

export function createInvestmentAccountsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentAccountDbProvider {
  return new DatabaseProvider<InvestmentAccountsDatabase>(config);
}
