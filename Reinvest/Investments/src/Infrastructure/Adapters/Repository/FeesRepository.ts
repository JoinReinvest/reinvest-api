import { InvestmentsDatabaseAdapterProvider, investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { Fee } from 'Reinvest/Investments/src/Domain/Investments/Fee';
import { InvestmentsFeesStatus } from 'Reinvest/Investments/src/Domain/Investments/Types';
export class FeesRepository {
  public static getClassName = (): string => 'FeesRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async get(investmentId: string) {
    const investment = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsFeesTable)
      .select(['accountId', 'amount', 'approveDate', 'approvedByIP', 'dateCreated', 'id', 'investmentId', 'profileId', 'status', 'verificationFeeId'])
      .where('investmentId', '=', investmentId)
      .executeTakeFirst();

    if (!investment) return false;

    return Fee.create(investment);
  }

  async approveFee(fee: Fee) {
    const { id, status, approveDate } = fee.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsFeesTable)
        .set({
          status,
          approveDate,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update fee's status: ${error.message}`, error);

      return false;
    }
  }

  async abortFeeForGivenInvestment(investmentId: string) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsFeesTable)
        .set({
          status: InvestmentsFeesStatus.ABORTED,
        })
        .where('investmentId', '=', investmentId)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update status of fee: ${error.message}`, error);

      return false;
    }
  }
}
