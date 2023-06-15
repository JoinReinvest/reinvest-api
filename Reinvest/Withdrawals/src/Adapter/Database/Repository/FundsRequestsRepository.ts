import { WithdrawalsDatabaseAdapterProvider } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

export class FundsRequestsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'FundsRequestsRepository';
}
