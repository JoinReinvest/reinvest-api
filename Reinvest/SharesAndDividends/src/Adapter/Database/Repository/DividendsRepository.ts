import { Money } from 'Money/Money';
import {
  sadInvestorDividendsTable,
  sadInvestorIncentiveDividendTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsSelection, InvestorIncentiveDividendTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { IncentiveReward, IncentiveRewardSchema, IncentiveRewardStatus, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';
import { UnpaidDividendsAndFees } from 'SharesAndDividends/Domain/Stats/StatsDividendsCalculationService';
import { DateTime } from 'Money/DateTime';

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
      .where('status', '=', <any>'AWAITING_ACTION')
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
    status: IncentiveRewardStatus | InvestorDividendStatus;
    type: 'DIVIDEND' | 'REWARD' | string;
  } | null> {
    const db = this.databaseAdapterProvider.provide();
    const data = await db
      .selectFrom(sadInvestorDividendsTable)
      .select(eb => ['id', 'dividendAmount as amount', 'createdDate', 'status', eb.val('DIVIDEND').as('type')])
      .union(
        // @ts-ignore
        db
          .selectFrom(sadInvestorIncentiveDividendTable)
          .select(eb => ['id', 'amount', 'createdDate', 'status', eb.val('REWARD').as('type')])
          .where('profileId', '=', <any>profileId)
          .where('id', '=', <any>dividendId),
      )
      .where('profileId', '=', profileId)
      .where('id', '=', dividendId)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return data;
  }

  async getDividends(
    profileId: string,
    accountId: string,
  ): Promise<
    | {
        amount: number;
        createdDate: Date;
        id: string;
        status: IncentiveRewardStatus | InvestorDividendStatus;
      }[]
    | null
  > {
    const db = this.databaseAdapterProvider.provide();
    const data = await db
      .selectFrom(sadInvestorDividendsTable)
      .select(['id', 'dividendAmount as amount', 'createdDate', 'status'])
      .union(
        // @ts-ignore
        db
          .selectFrom(sadInvestorIncentiveDividendTable)
          .select(['id', 'amount', 'createdDate', 'status'])
          .where('profileId', '=', <any>profileId)
          .where('accountId', '=', <any>accountId),
      )
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .execute();

    if (!data) {
      return null;
    }

    return data;
  }

  async markIncentiveDividendAs(status: IncentiveRewardStatus, profileId: string, dividendId: string, accountId: string | null = null): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(sadInvestorIncentiveDividendTable)
      .set({ status, accountId: accountId, actionDate: DateTime.now().toDate() })
      .where('profileId', '=', profileId)
      .where('id', '=', dividendId)
      .execute();
  }

  async markDividendAs(status: InvestorDividendStatus, profileId: string, dividendId: string): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(sadInvestorDividendsTable)
      .set({ status, actionDate: DateTime.now().toDate() })
      .where('profileId', '=', profileId)
      .where('id', '=', dividendId)
      .execute();
  }

  async getAwaitingDividendsForAccountState(profileId: string, accountId: string) {
    const db = this.databaseAdapterProvider.provide();
    const data = await db
      .selectFrom(sadInvestorDividendsTable)
      .select(['id', 'totalDividendAmount', 'totalFeeAmount'])
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', 'in', [InvestorDividendStatus.AWAITING_ACTION, InvestorDividendStatus.FEES_NOT_COVERED])
      .execute();

    if (!data) {
      return [];
    }

    return data;
  }

  async getAwaitingReferralRewardsForAccountState(profileId: string, accountId: string) {
    const db = this.databaseAdapterProvider.provide();
    const data = await db
      .selectFrom(sadInvestorIncentiveDividendTable)
      .select(['id', 'amount'])
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .where('status', '=', IncentiveRewardStatus.AWAITING_ACTION)
      .execute();

    if (!data) {
      return [];
    }

    return data;
  }
}
