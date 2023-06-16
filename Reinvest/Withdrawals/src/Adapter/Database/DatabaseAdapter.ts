import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import type { WithdrawalsFundsRequestsAgreementsTable, WithdrawalsFundsRequestsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';

export const withdrawalsFundsRequestsTable = 'withdrawals_funds_requests';
export const withdrawalsFundsRequestsAgreementsTable = 'withdrawals_funds_requests_agreements';

export interface WithdrawalsDatabase {
  [withdrawalsFundsRequestsAgreementsTable]: WithdrawalsFundsRequestsAgreementsTable;
  [withdrawalsFundsRequestsTable]: WithdrawalsFundsRequestsTable;
}

export const WithdrawalsDatabaseAdapterInstanceProvider = 'WithdrawalsDatabaseAdapterProvider';
export type WithdrawalsDatabaseAdapterProvider = DatabaseProvider<WithdrawalsDatabase>;

export function createWithdrawalsDatabaseAdapterProvider(config: PostgreSQLConfig): WithdrawalsDatabaseAdapterProvider {
  return new DatabaseProvider<WithdrawalsDatabase>(config);
}
