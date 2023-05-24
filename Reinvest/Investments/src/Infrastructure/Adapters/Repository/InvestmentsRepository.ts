import { InvestmentsDatabaseAdapterProvider, investmentsFeesTable, investmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import type { InvestmentCreate } from 'Investments/Infrastructure/UseCases/CreateInvestment';
import { Investment } from 'Investments/Infrastructure/ValueObject/Investment';
import type { Money } from 'Money/Money';
import { InvestmentSummarySchema } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import type { DomainEvent } from 'SimpleAggregator/Types';

import { InvestmentSummary } from '../../ValueObject/InvestmentSummary';

export class InvestmentsRepository {
  public static getClassName = (): string => 'InvestmentsRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  async get(investmentId: string) {
    const investment = await this.databaseAdapterProvider
      .provide()
      .selectFrom(investmentsTable)
      .select([
        'accountId',
        'amount',
        'bankAccountId',
        'dateCreated',
        'dateUpdated',
        'id',
        'profileId',
        'recurringInvestmentId',
        'scheduledBy',
        'status',
        'subscriptionAgreementId',
        'tradeId',
      ])
      .where('id', '=', investmentId)
      .executeTakeFirst();

    if (!investment) return false;

    return Investment.create(investment);
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
      ])
      .select([`${investmentsFeesTable}.amount as feeAmount`])
      .where(`${investmentsTable}.id`, '=', investmentId)
      .executeTakeFirst();

    if (!investmentSummary) return false;

    return InvestmentSummary.create(investmentSummary as InvestmentSummarySchema);
  }

  async create(investment: InvestmentCreate, money: Money) {
    const { id, profileId, accountId, bankAccountId, scheduledBy, status, tradeId } = investment;
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
          dateUpdated: new Date(),
          subscriptionAgreementId: null,
          scheduledBy,
          recurringInvestmentId: null,
          status,
          tradeId,
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

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }
}
