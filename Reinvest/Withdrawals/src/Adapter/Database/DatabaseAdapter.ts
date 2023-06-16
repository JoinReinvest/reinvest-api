import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { WithdrawalsDividendsRequestsTable, WithdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';

export const withdrawalsFundsRequestsTable = 'withdrawals_funds_requests';
export const withdrawalsDividendsRequestsTable = 'withdrawals_dividends_requests';

export interface WithdrawalsDatabase {
  [withdrawalsDividendsRequestsTable]: WithdrawalsDividendsRequestsTable;
  [withdrawalsFundsRequestsTable]: WithdrawalsFundsRequestsTable;
}

export const WithdrawalsDatabaseAdapterInstanceProvider = 'WithdrawalsDatabaseAdapterProvider';
export type WithdrawalsDatabaseAdapterProvider = DatabaseProvider<WithdrawalsDatabase>;

export function createWithdrawalsDatabaseAdapterProvider(config: PostgreSQLConfig): WithdrawalsDatabaseAdapterProvider {
  return new DatabaseProvider<WithdrawalsDatabase>(config);
}
