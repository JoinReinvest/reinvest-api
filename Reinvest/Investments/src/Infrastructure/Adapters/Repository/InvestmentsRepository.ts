import { UUID } from 'HKEKTypes/Generics';
import { InvestmentsDatabaseAdapterProvider, investmentsFeesTable, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentSummary } from 'Investments/Infrastructure/ValueObject/InvestmentSummary';
import type { Money } from 'Money/Money';
import { Pagination } from 'Reinvest/Investments/src/Application/Pagination';
import type { InvestmentCreate } from 'Reinvest/Investments/src/Application/UseCases/CreateInvestment';
import { Investment, InvestmentWithFee } from 'Reinvest/Investments/src/Domain/Investments/Investment';
import { InvestmentSummarySchema } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import type { DomainEvent } from 'SimpleAggregator/Types';

import { FeesRepository } from './FeesRepository';

export class InvestmentsRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private feesRepository: FeesRepository;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, feesRepository: FeesRepository, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.feesRepository = feesRepository;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'InvestmentsRepository';

  async get(investmentId: string): Promise<Investment | null> {
    const investment = await this.getInvestmentQueryBuilder().where(`${investmentsTable}.id`, '=', investmentId).executeTakeFirst();

    if (!investment) {
      return null;
    }

    return Investment.create(investment);
  }

  async getInvestmentByProfileAndId(profileId: UUID, investmentId: UUID): Promise<Investment | null> {
    const investment = await this.getInvestmentQueryBuilder()
      .where(`${investmentsTable}.id`, '=', investmentId)
      .where(`${investmentsTable}.profileId`, '=', profileId)
      .executeTakeFirst();

    if (!investment) {
      return null;
    }

    return Investment.create(investment);
  }

  private getInvestmentQueryBuilder() {
    return this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .leftJoin(investmentsFeesTable, `${investmentsFeesTable}.investmentId`, `${investmentsTable}.id`)
      .select([
        `${investmentsTable}.accountId`,
        `${investmentsTable}.amount`,
        `${investmentsTable}.bankAccountId`,
        `${investmentsTable}.dateCreated`,
        `${investmentsTable}.dateUpdated`,
        `${investmentsTable}.id`,
        `${investmentsTable}.profileId`,
        `${investmentsTable}.recurringInvestmentId`,
        `${investmentsTable}.scheduledBy`,
        `${investmentsTable}.status`,
        `${investmentsTable}.subscriptionAgreementId`,
        `${investmentsTable}.tradeId`,
        `${investmentsTable}.dateStarted`,
        `${investmentsTable}.portfolioId`,
        `${investmentsTable}.parentId`,
      ])
      .select([
        `${investmentsFeesTable}.amount as feeAmount`,
        `${investmentsFeesTable}.approveDate`,
        `${investmentsFeesTable}.abortedDate`,
        `${investmentsFeesTable}.approvedByIP`,
        `${investmentsFeesTable}.dateCreated as feeDateCreated`,
        `${investmentsFeesTable}.id as feeId`,
        `${investmentsFeesTable}.investmentId`,
        `${investmentsFeesTable}.status as feeStatus`,
        `${investmentsFeesTable}.verificationFeeIdsJson`,
      ])
      .castTo<InvestmentWithFee>();
  }

  async getInvestments(profileId: string, accountId: string, pagination: Pagination): Promise<Investment[]> {
    const investmentsData = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .leftJoin(investmentsFeesTable, `${investmentsFeesTable}.investmentId`, `${investmentsTable}.id`)
      .select([
        `${investmentsTable}.accountId`,
        `${investmentsTable}.amount`,
        `${investmentsTable}.bankAccountId`,
        `${investmentsTable}.dateCreated`,
        `${investmentsTable}.dateUpdated`,
        `${investmentsTable}.id`,
        `${investmentsTable}.profileId`,
        `${investmentsTable}.recurringInvestmentId`,
        `${investmentsTable}.scheduledBy`,
        `${investmentsTable}.status`,
        `${investmentsTable}.subscriptionAgreementId`,
        `${investmentsTable}.tradeId`,
        `${investmentsTable}.dateStarted`,
        `${investmentsTable}.portfolioId`,
        `${investmentsTable}.parentId`,
      ])
      .select([
        `${investmentsFeesTable}.amount as feeAmount`,
        `${investmentsFeesTable}.approveDate`,
        `${investmentsFeesTable}.abortedDate`,
        `${investmentsFeesTable}.approvedByIP`,
        `${investmentsFeesTable}.dateCreated as feeDateCreated`,
        `${investmentsFeesTable}.id as feeId`,
        `${investmentsFeesTable}.investmentId`,
        `${investmentsFeesTable}.status as feeStatus`,
        `${investmentsFeesTable}.verificationFeeIdsJson`,
      ])
      .castTo<InvestmentWithFee>()
      .where(`${investmentsTable}.profileId`, '=', profileId)
      .where(`${investmentsTable}.accountId`, '=', accountId)
      .orderBy('dateCreated', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    if (!investmentsData.length) {
      return [];
    }

    const investments = investmentsData.map(investment => Investment.create(investment));

    return investments;
  }

  async getInvestmentForSummary(investmentId: string) {
    const investmentSummary = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .leftJoin(investmentsFeesTable, `${investmentsFeesTable}.investmentId`, `${investmentsTable}.id`)
      .select([
        `${investmentsTable}.amount`,
        `${investmentsTable}.dateCreated`,
        `${investmentsTable}.id`,
        `${investmentsTable}.status`,
        `${investmentsTable}.subscriptionAgreementId`,
        `${investmentsTable}.tradeId`,
        `${investmentsTable}.bankAccountId`,
      ])
      .select([`${investmentsFeesTable}.amount as feeAmount`])
      .where(`${investmentsTable}.id`, '=', investmentId)
      .executeTakeFirst();

    if (!investmentSummary) {
      return null;
    }

    return InvestmentSummary.create(investmentSummary as InvestmentSummarySchema);
  }

  async create(investment: InvestmentCreate, money: Money) {
    const { id, profileId, accountId, bankAccountId, scheduledBy, status, tradeId, portfolioId, parentId } = investment;
    const amount = money.getAmount();
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(investmentsTable)
        .values({
          id,
          profileId,
          amount,
          accountId,
          bankAccountId,
          dateCreated: new Date(),
          dateStarted: null,
          dateUpdated: new Date(),
          subscriptionAgreementId: null,
          scheduledBy,
          recurringInvestmentId: null,
          status,
          tradeId,
          portfolioId,
          parentId,
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create investment: ${error.message}`, error);

      return false;
    }
  }

  async assignSubscriptionAgreementAndUpdateStatus(investment: Investment, events?: any) {
    const { id, status, subscriptionAgreementId } = investment.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsTable)
        .set({
          subscriptionAgreementId,
          status,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot asign subscription agreement to investment and update its status: ${error.message}`, error);

      return false;
    }
  }

  async updateStatus(investment: Investment) {
    const { id, status } = investment.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsTable)
        .set({
          status,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update status of investment: ${error.message}`, error);

      return false;
    }
  }

  async updateInvestment(investment: Investment, approveFee: boolean, events: DomainEvent[] = []) {
    const { id, status, dateStarted, accountId, profileId, amount, portfolioId, parentId } = investment.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(investmentsTable)
        .set({
          dateStarted,
          status,
        })
        .where('id', '=', id)
        .execute();

      if (approveFee) {
        const fee = investment.getFee();
        fee && (await this.feesRepository.storeFee(fee));
      }

      await this.publishEvents(events);

      return true;
    } catch (error: any) {
      console.error(`Cannot start investment: ${error.message}`, error);

      return false;
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }
}
