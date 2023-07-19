import { WithdrawalsDatabaseAdapterProvider, withdrawalsDividendsRequestsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';
import { DividendWithdrawalDecision, DividendWithdrawalRequest } from 'Withdrawals/Domain/DividendWithdrawalRequest';

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
          withdrawalId: values.withdrawalId,
          dateDecided: values.dateDecided,
        }),
      )
      .execute();
  }

  async getAllAcceptedDividendsRequests(): Promise<DividendWithdrawalRequest[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsDividendsRequestsTable)
      .selectAll()
      .where('withdrawalId', '=', null)
      .where('status', 'in', [DividendWithdrawalDecision.ACCEPTED, DividendWithdrawalDecision.AUTO_ACCEPTED])
      .execute();

    if (!data.length) {
      return [];
    }

    const dividendsRequests = data.map(dividendsRequest => DividendWithdrawalRequest.restore(dividendsRequest));

    return dividendsRequests;
  }

  async assignWithdrawalId(dividendRequest: DividendWithdrawalRequest) {
    const { withdrawalId } = dividendRequest.getObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(withdrawalsDividendsRequestsTable)
        .set({
          withdrawalId,
        })
        .where('id', '=', dividendRequest.getId())
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot assign withdrawalId: ${error.message}`, error);

      return false;
    }
  }
}
