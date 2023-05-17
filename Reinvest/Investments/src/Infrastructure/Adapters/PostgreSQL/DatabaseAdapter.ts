import { Kysely } from 'kysely';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { InvestmentsTable } from 'Reinvest/Investments/src/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

export const investmentsTable = 'investments_investments';

export interface InvestmentsDatabase {
  [investmentsTable]: InvestmentsTable;
}

export const InvestmentsDatabaseAdapterInstanceProvider = 'InvestmentsDatabaseAdapterProvider';
export type InvestmentsDatabaseAdapter = Kysely<InvestmentsDatabase>;
export type InvestmentsDatabaseAdapterProvider = DatabaseProvider<InvestmentsDatabase>;

export function createInvestmentsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentsDatabaseAdapterProvider {
  return new DatabaseProvider<InvestmentsDatabase>(config);
}
