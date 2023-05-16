import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { AggregateTable } from 'SimpleAggregator/Storage/Schema';

export interface InvestmentsDatabase {
  investments__profile_aggregate: AggregateTable;
}

export const investmentsDatabaseProviderName = 'DatabaseProviderInvestmentsDatabase';
export type InvestmentsDbProvider = DatabaseProvider<InvestmentsDatabase>;

export function createInvestmentsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentsDbProvider {
  return new DatabaseProvider<InvestmentsDatabase>(config);
}
