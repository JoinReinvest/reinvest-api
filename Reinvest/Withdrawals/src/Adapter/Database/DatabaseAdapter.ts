import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { WithdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';

export const withdrawalsFundsRequestsTable = 'withdrawals_funds_requests';

export interface WithdrawalsDatabase {
  [withdrawalsFundsRequestsTable]: WithdrawalsFundsRequestsTable;
}

export const WithdrawalsDatabaseAdapterInstanceProvider = 'WithdrawalsDatabaseAdapterProvider';
export type WithdrawalsDatabaseAdapterProvider = DatabaseProvider<WithdrawalsDatabase>;

export function createWithdrawalsDatabaseAdapterProvider(config: PostgreSQLConfig): WithdrawalsDatabaseAdapterProvider {
  return new DatabaseProvider<WithdrawalsDatabase>(config);
}
