import { InvestmentsTable, SubscriptionAgreementTable, TransactionEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { Kysely } from 'kysely';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const investmentsTable = 'investments_investments';
export const transactionEventsTable = 'investments_transaction_events';
export const subscriptionAgreementTable = 'investments_subscription_agreements';

export interface InvestmentsDatabase {
  [investmentsTable]: InvestmentsTable;
  [subscriptionAgreementTable]: SubscriptionAgreementTable;
  [transactionEventsTable]: TransactionEventsTable;
}

export const InvestmentsDatabaseAdapterInstanceProvider = 'InvestmentsDatabaseAdapterProvider';
export type InvestmentsDatabaseAdapter = Kysely<InvestmentsDatabase>;
export type InvestmentsDatabaseAdapterProvider = DatabaseProvider<InvestmentsDatabase>;

export function createInvestmentsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentsDatabaseAdapterProvider {
  return new DatabaseProvider<InvestmentsDatabase>(config);
}
