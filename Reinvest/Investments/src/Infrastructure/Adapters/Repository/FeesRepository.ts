import { InvestmentsDatabaseAdapterProvider, investmentsFeesTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';

import { Fee } from '../../ValueObject/Fee';

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
    const { id, status } = fee.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsFeesTable)
        .set({
          status,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update fee's status: ${error.message}`, error);

      return false;
    }
  }
}
