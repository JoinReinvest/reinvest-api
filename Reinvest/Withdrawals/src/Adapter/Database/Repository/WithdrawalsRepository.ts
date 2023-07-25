import { JSONObjectOf, Pagination, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { UUIDsList, Withdrawal } from 'Reinvest/Withdrawals/src/Domain/Withdrawal';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { WithdrawalsDatabaseAdapterProvider, withdrawalsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

import { WithdrawalsTable } from '../WithdrawalsSchema';

export class WithdrawalsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'WithdrawalsRepository';

  async store(withdrawal: Withdrawal) {
    const schema = this.castToTable(withdrawal);

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(withdrawalsTable)
        .values(schema)
        .onConflict(oc =>
          oc.column('id').doUpdateSet({
            status: eb => eb.ref(`excluded.status`),
            dateCompleted: eb => eb.ref(`excluded.dateCompleted`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create funds withdrawal request: ${error.message}`, error);

      return false;
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  private castToObject(data: WithdrawalsTable): Withdrawal {
    return Withdrawal.restore({
      ...data,
      listOfWithdrawals: <UUIDsList>data.listOfWithdrawalsJson,
      listOfDividends: <UUIDsList>data.listOfDividendsJson,
      dateCreated: DateTime.from(data.dateCreated),
      dateCompleted: data.dateCompleted ? DateTime.from(data.dateCompleted) : null,
    });
  }

  private castToTable(object: Withdrawal): WithdrawalsTable {
    const { listOfWithdrawals, listOfDividends, ...schema } = object.toObject();

    return {
      ...schema,
      listOfWithdrawalsJson: listOfWithdrawals as JSONObjectOf<UUIDsList>,
      listOfDividendsJson: listOfDividends as JSONObjectOf<UUIDsList>,
      dateCreated: schema.dateCreated.toDate(),
      dateCompleted: schema.dateCompleted?.toDate() ?? null,
    };
  }

  async getById(withdrawalId: UUID): Promise<Withdrawal | null> {
    const result = await this.databaseAdapterProvider.provide().selectFrom(withdrawalsTable).selectAll().where('id', '=', withdrawalId).executeTakeFirst();

    if (!result) {
      return null;
    }

    return this.castToObject(result);
  }

  async listWithdrawals(pagination: Pagination): Promise<Withdrawal[]> {
    const results = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsTable)
      .selectAll()
      .orderBy('dateCreated', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    if (!results.length) {
      return [];
    }

    return results.map(result => this.castToObject(result));
  }
}
