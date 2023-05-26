import { Kysely } from 'kysely';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import type {
  InvestmentsFeesTable,
  InvestmentsTable,
  RecurringInvestmentsTable,
  SubscriptionAgreementTable,
  TransactionEventsTable,
} from 'Reinvest/Investments/src/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

export const investmentsTable = 'investments_investments';
export const transactionEventsTable = 'investments_transaction_events';
export const subscriptionAgreementTable = 'investments_subscription_agreements';
export const investmentsFeesTable = 'investments_investments_fees';
export const recurringInvestmentsTable = 'investments_recurring_investments';

export interface InvestmentsDatabase {
  [investmentsFeesTable]: InvestmentsFeesTable;
  [investmentsTable]: InvestmentsTable;
  [recurringInvestmentsTable]: RecurringInvestmentsTable;
  [subscriptionAgreementTable]: SubscriptionAgreementTable;
  [transactionEventsTable]: TransactionEventsTable;
}

export const InvestmentsDatabaseAdapterInstanceProvider = 'InvestmentsDatabaseAdapterProvider';
export type InvestmentsDatabaseAdapter = Kysely<InvestmentsDatabase>;
export type InvestmentsDatabaseAdapterProvider = DatabaseProvider<InvestmentsDatabase>;

export function createInvestmentsDatabaseAdapterProvider(config: PostgreSQLConfig): InvestmentsDatabaseAdapterProvider {
  return new DatabaseProvider<InvestmentsDatabase>(config);
}
