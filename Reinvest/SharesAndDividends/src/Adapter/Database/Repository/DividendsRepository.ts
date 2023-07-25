import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import {
  sadAccountsConfiguration,
  sadInvestorDividendsTable,
  sadInvestorIncentiveDividendTable,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsSelection, InvestorIncentiveDividendTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';
import { ConfigurationTypes } from 'SharesAndDividends/Domain/Configuration/ConfigurationTypes';
import { IncentiveReward, IncentiveRewardSchema, IncentiveRewardStatus, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { AUTO_REINVESTMENT_DAYS_THRESHOLD, InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';
import { UnpaidDividendsAndFees } from 'SharesAndDividends/Domain/Stats/StatsDividendsCalculationService';
import { AutoReinvestDividend } from 'SharesAndDividends/UseCase/DividendsQuery';

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
    {
      amount: number;
      createdDate: Date;
      id: string;
      status: IncentiveRewardStatus | InvestorDividendStatus;
    }[]
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
          .where(eb => eb.where('accountId', '=', <any>accountId).orWhere('accountId', 'is', null)),
      )
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .execute();

    if (data.length === 0) {
      return [];
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

  async findDividendsReadyForAutomaticReinvestment(): Promise<AutoReinvestDividend[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(sadInvestorDividendsTable)
      .select(eb => [
        `${sadInvestorDividendsTable}.id`,
        `${sadInvestorDividendsTable}.accountId`,
        `${sadInvestorDividendsTable}.profileId`,
        eb
          .selectFrom(sadAccountsConfiguration)
          .select(`${sadAccountsConfiguration}.configValueJson`)
          .whereRef(`${sadAccountsConfiguration}.accountId`, '=', `${sadInvestorDividendsTable}.accountId`)
          .where(`${sadAccountsConfiguration}.configType`, '=', ConfigurationTypes.AUTOMATIC_DIVIDEND_REINVESTMENT_OPT_IN_OUT)
          .orderBy(`${sadAccountsConfiguration}.dateUpdated`, 'desc')
          .limit(1)
          .as('configValueJson'),
      ])
      .where(`${sadInvestorDividendsTable}.status`, '=', [InvestorDividendStatus.AWAITING_ACTION])
      .where(`${sadInvestorDividendsTable}.createdDate`, '<=', DateTime.now().subtractDays(AUTO_REINVESTMENT_DAYS_THRESHOLD).toDate())
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data
      .filter(record => !!record.configValueJson && record.configValueJson.value === true)
      .map(record => ({
        accountId: record.accountId,
        profileId: record.profileId,
        dividendId: record.id,
      }));
  }

  async markIncentiveDividendsAs(status: IncentiveRewardStatus, dividendsIds: UUID[], isInState: IncentiveRewardStatus): Promise<void> {
    if (dividendsIds.length === 0) {
      return;
    }

    await this.databaseAdapterProvider
      .provide()
      .updateTable(sadInvestorIncentiveDividendTable)
      .set({ status })
      .where('id', 'in', dividendsIds)
      .where('status', '=', isInState)
      .execute();
  }

  async markDividendsAs(status: InvestorDividendStatus, dividendsIds: UUID[], isInState: InvestorDividendStatus): Promise<void> {
    if (dividendsIds.length === 0) {
      return;
    }

    await this.databaseAdapterProvider
      .provide()
      .updateTable(sadInvestorDividendsTable)
      .set({ status })
      .where('id', 'in', dividendsIds)
      .where('status', '=', isInState)
      .execute();
  }
}
