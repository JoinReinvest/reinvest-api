import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import type { WithdrawalsFundsRequestsAgreementsTable, WithdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';
import { WithdrawalsDividendsRequestsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';

export const withdrawalsFundsRequestsTable = 'withdrawals_funds_requests';
export const withdrawalsFundsRequestsAgreementsTable = 'withdrawals_funds_requests_agreements';
export const withdrawalsDividendsRequestsTable = 'withdrawals_dividends_requests';

export interface WithdrawalsDatabase {
  [withdrawalsDividendsRequestsTable]: WithdrawalsDividendsRequestsTable;
  [withdrawalsFundsRequestsAgreementsTable]: WithdrawalsFundsRequestsAgreementsTable;
  [withdrawalsFundsRequestsTable]: WithdrawalsFundsRequestsTable;
}

export const WithdrawalsDatabaseAdapterInstanceProvider = 'WithdrawalsDatabaseAdapterProvider';
export type WithdrawalsDatabaseAdapterProvider = DatabaseProvider<WithdrawalsDatabase>;

export function createWithdrawalsDatabaseAdapterProvider(config: PostgreSQLConfig): WithdrawalsDatabaseAdapterProvider {
  return new DatabaseProvider<WithdrawalsDatabase>(config);
}
