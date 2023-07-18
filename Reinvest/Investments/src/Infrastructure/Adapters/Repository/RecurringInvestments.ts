import { Pagination, UUID } from 'HKEKTypes/Generics';
import { InvestmentsDatabaseAdapterProvider, recurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { RecurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { RecurringInvestment, RecurringInvestmentSchema } from 'Reinvest/Investments/src/Domain/Investments/RecurringInvestment';
import { RecurringInvestmentStatus } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import type { DomainEvent } from 'SimpleAggregator/Types';

export class RecurringInvestmentsRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'RecurringInvestmentsRepository';

  async getRecurringInvestment(profileId: UUID, accountId: UUID, status: RecurringInvestmentStatus): Promise<RecurringInvestment | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsTable)
      .selectAll()
      .where('accountId', '=', accountId)
      .where('profileId', '=', profileId)
      .where('status', '=', status)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async store(recurringInvestment: RecurringInvestment, events: DomainEvent[] = []) {
    const values = this.castToTable(recurringInvestment);

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(recurringInvestmentsTable)
        .values(values)
        .onConflict(oc =>
          oc.column('id').doUpdateSet({
            status: eb => eb.ref(`excluded.status`),
            nextDate: eb => eb.ref(`excluded.nextDate`),
            subscriptionAgreementId: eb => eb.ref(`excluded.subscriptionAgreementId`),
          }),
        )
        .execute();

      if (events.length > 0) {
        await this.publishEvents(events);
      }

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

  async updateStatus(recurringInvestment: RecurringInvestment): Promise<boolean> {
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

  private async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  private castToObject(tableData: RecurringInvestmentsTable): RecurringInvestment {
    return RecurringInvestment.restore(<RecurringInvestmentSchema>{
      ...tableData,
      amount: Money.lowPrecision(tableData.amount),
      dateCreated: DateTime.from(tableData.dateCreated),
      startDate: DateTime.fromIsoDate(tableData.startDate),
      nextDate: DateTime.fromIsoDate(tableData.nextDate),
    });
  }

  private castToTable(object: RecurringInvestment): RecurringInvestmentsTable {
    const data = object.toObject();

    return <RecurringInvestmentsTable>{
      ...data,
      amount: data.amount.getAmount(),
      dateCreated: data.dateCreated.toDate(),
      startDate: data.startDate.toDate(),
      nextDate: data.nextDate.toDate(),
    };
  }

  async getActiveRecurringInvestmentReadyToExecute(pagination: Pagination): Promise<
    {
      accountId: UUID;
      id: UUID;
      profileId: UUID;
    }[]
  > {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsTable)
      .select(['id', 'profileId', 'accountId'])
      .where('status', '=', RecurringInvestmentStatus.ACTIVE)
      .where('nextDate', '<=', DateTime.now().toDate())
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data;
  }

  async getRecurringInvestmentById(recurringInvestmentId: UUID): Promise<RecurringInvestment | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsTable)
      .selectAll()
      .where('id', '=', recurringInvestmentId)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async getUserAllActiveRecurringInvestments(profileId: UUID): Promise<RecurringInvestment[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(recurringInvestmentsTable)
      .selectAll()
      .where('profileId', '=', profileId)
      .where('status', '=', RecurringInvestmentStatus.ACTIVE)
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data.map(record => this.castToObject(record));
  }
}
