import { WithdrawalsDatabaseAdapterProvider, withdrawalsDividendsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { DividendWithdrawalRequest } from 'Withdrawals/Domain/DividendWithdrawalRequest';

export class DividendsRequestsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'DividendsRequestsRepository';

  async store(dividendRequest: DividendWithdrawalRequest): Promise<void> {
    const values = dividendRequest.getObject();
    await this.databaseAdapterProvider
      .provide()
      .insertInto(withdrawalsDividendsRequestsTable)
      .values(values)
      .onConflict(oc =>
        oc.column('dividendId').doUpdateSet({
          status: values.status,
          payoutId: values.payoutId,
          dateDecided: values.dateDecided,
        }),
      )
      .execute();
  }
}
