import { InvestmentsDatabaseAdapterProvider, recurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import type { RecurringInvestmentDraftCreate } from 'Reinvest/Investments/src/Application/UseCases/CreateDraftRecurringInvestment';
import { RecurringInvestment } from 'Reinvest/Investments/src/Domain/Investments/RecurringInvestment';
import { RecurringInvestmentStatus } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import type { DomainEvent } from 'SimpleAggregator/Types';
import { UUID } from 'HKEKTypes/Generics';

export class RecurringInvestmentsRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'RecurringInvestmentsRepository';

  async get(profileId: UUID, accountId: UUID, status: RecurringInvestmentStatus) {
    const recurringInvestment = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsTable)
      .selectAll()
      .where('accountId', '=', accountId)
      .where('profileId', '=', profileId)
      .where('status', '=', status)
      .executeTakeFirst();

    if (!recurringInvestment) {
      return null;
    }

    return RecurringInvestment.create(recurringInvestment);
  }

  async create(recurringInvestment: RecurringInvestmentDraftCreate) {
    const { id, accountId, profileId, portfolioId, money, startDate, frequency, status } = recurringInvestment;
    const amount = money.getAmount();

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(recurringInvestmentsTable)
        .values({
          accountId,
          amount,
          dateCreated: new Date(),
          frequency,
          id,
          portfolioId,
          profileId,
          startDate: new Date(startDate),
          status,
          subscriptionAgreementId: null,
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create recurring investment: ${error.message}`, error);

      return false;
    }
  }

  async delete(accountId: string, profileId: string, recurringInvestmentId: string) {
    try {
      await this.databaseAdapterProvider
        .provide()
        .deleteFrom(recurringInvestmentsTable)
        .where('id', '=', recurringInvestmentId)
        .where('accountId', '=', accountId)
        .where('profileId', '=', profileId)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot delete recurring investment: ${error.message}`, error);

      return false;
    }
  }

  async assignSubscriptionAgreementAndUpdateStatus(investment: RecurringInvestment, events?: any) {
    const { id, subscriptionAgreementId } = investment.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(recurringInvestmentsTable)
        .set({
          subscriptionAgreementId,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot asign subscription agreement to recurring investment and update its status: ${error.message}`, error);

      return false;
    }
  }

  async updateStatus(recurringInvestment: RecurringInvestment) {
    const { id, status } = recurringInvestment.toObject();
    try {
      await this.databaseAdapterProvider
        .provide()
        .updateTable(recurringInvestmentsTable)
        .set({
          status,
        })
        .where('id', '=', id)
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot update status of recurring investment: ${error.message}`, error);

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
