import { Money } from 'Money/Money';
import {
  sadInvestorDividendsTable,
  sadInvestorIncentiveDividendTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsSelection, InvestorIncentiveDividendTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { UnpaidDividendsAndFees } from 'SharesAndDividends/Domain/DividendsCalculationService';
import { IncentiveReward, IncentiveRewardSchema } from 'SharesAndDividends/Domain/IncentiveReward';

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

  async getIncentiveReward(profileId: string) {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadInvestorIncentiveDividendTable)
      .select(['actionDate', 'amount', 'createdDate', 'status', 'id', 'profileId', 'accountId'])
      .where('profileId', '=', profileId)
      .limit(1)
      .castTo<IncentiveRewardSchema>()
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return IncentiveReward.restore(data);
  }

  async createIncentiveReward(reward: IncentiveReward) {
    const values = <InvestorIncentiveDividendTable>reward.toObject();

    await this.databaseAdapterProvider
      .provide()
      .insertInto(sadInvestorIncentiveDividendTable)
      .values(values)
      .onConflict(oc => oc.column('profileId').doNothing())
      .execute();
  }
}
