import { Kysely } from 'kysely';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import type {
  InvestmentsFeesTable,
  InvestmentsTable,
  SubscriptionAgreementTable,
} from 'Reinvest/Investments/src/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

export const investmentsTable = 'investments_investments';
export const subscriptionAgreementTable = 'investments_subscription_agreements';
export const investmentsFeesTable = 'investments_investments_fees';

export interface InvestmentsDatabase {
  [investmentsFeesTable]: InvestmentsFeesTable;
  [investmentsTable]: InvestmentsTable;
  [subscriptionAgreementTable]: SubscriptionAgreementTable;
}

export const InvestmentsDatabaseAdapterInstanceProvider = 'InvestmentsDatabaseAdapterProvider';
export type InvestmentsDatabaseAdapter = Kysely<InvestmentsDatabase>;
export type InvestmentsDatabaseAdapterProvider = DatabaseProvider<InvestmentsDatabase>;

export function createInvestmentsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentsDatabaseAdapterProvider {
  return new DatabaseProvider<InvestmentsDatabase>(config);
}
