import { Money } from 'Money/Money';
import {
  sadInvestorDividendsTable,
  sadInvestorIncentiveDividendTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsSelection, InvestorIncentiveDividendTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { UnpaidDividendsAndFees } from 'SharesAndDividends/Domain/DividendsCalculationService';
import { IncentiveReward, IncentiveRewardSchema, IncentiveRewardStatus, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';

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

  async getIncentiveReward(profileId: string, theOtherProfileId: string, rewardType: RewardType): Promise<IncentiveReward | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadInvestorIncentiveDividendTable)
      .select(['actionDate', 'amount', 'createdDate', 'status', 'id', 'profileId', 'accountId', 'rewardType', 'theOtherProfileId'])
      .where('profileId', '=', profileId)
      .where('theOtherProfileId', '=', theOtherProfileId)
      .where('rewardType', '=', rewardType)
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
      .onConflict(oc => oc.constraint('unique_incentive_reward').doNothing())
      .execute();
  }

  async findDividend(
    profileId: string,
    dividendId: string,
  ): Promise<{
    amount: number;
    createdDate: Date;
    id: string;
    status: 'AWAITING_ACTION' | 'REINVESTED' | 'WITHDRAWN' | 'ZEROED' | 'WITHDRAWING';
  } | null> {
    const db = this.databaseAdapterProvider.provide();
    const data = await db
      .selectFrom(sadInvestorDividendsTable)
      .select(['id', 'totalDividendAmount as amount', 'createdDate', 'status'])
      .union(db.selectFrom(sadInvestorIncentiveDividendTable).select(['id', 'amount', 'createdDate', 'status']))
      .where('profileId', '=', profileId)
      .where('id', '=', dividendId)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return data;
  }

  async markIncentiveDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(sadInvestorIncentiveDividendTable)
      .set({ status: IncentiveRewardStatus.REINVESTED, accountId: accountId, actionDate: new Date() })
      .where('profileId', '=', profileId)
      .where('id', '=', dividendId)
      .execute();
  }
}
