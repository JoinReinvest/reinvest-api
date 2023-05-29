import { Money } from 'Money/Money';
import { sadInvestorDividendsTable, SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsSelection } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { UnpaidDividendsAndFees } from 'SharesAndDividends/Domain/DividendsCalculationService';

export class DividendsRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'DividendsRepository';

  async getUnpaidDividendsAndFees(profileId: string, accountId: string): Promise<UnpaidDividendsAndFees[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadInvestorDividendsTable)
      .select(['totalDividendAmount', 'totalFeeAmount'])
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', '=', 'AWAITING_ACTION')
      .castTo<DividendsSelection>()
      .execute();

    if (!data) {
      return [];
    }

    return data.map((dividendsSelection: DividendsSelection): UnpaidDividendsAndFees => {
      return {
        dividend: new Money(dividendsSelection.totalDividendAmount),
        fee: new Money(dividendsSelection.totalFeeAmount),
      };
    });
  }
}
