import { JSONObjectOf } from 'HKEKTypes/Generics';
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

  async create(withdrawal: Withdrawal) {
    const schema = this.castToTable(withdrawal);

    try {
      await this.databaseAdapterProvider.provide().insertInto(withdrawalsTable).values(schema).execute();

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
    return Withdrawal.create({
      ...data,
      listOfWithdrawals: <UUIDsList>data.listOfWithdrawalsJson,
      listOfDividends: <UUIDsList>data.listOfDividendsJson,
      dateCreated: DateTime.from(data.dateCreated),
      dateCompleted: data.dateCompleted ? DateTime.from(data.dateCompleted) : null,
    });
  }

  private castToTable(object: Withdrawal): WithdrawalsTable {
    const schema = object.toObject();

    return {
      ...schema,
      listOfWithdrawalsJson: schema.listOfWithdrawals as JSONObjectOf<UUIDsList>,
      listOfDividendsJson: schema.listOfDividends as JSONObjectOf<UUIDsList>,
      dateCreated: schema.dateCreated.toDate(),
      dateCompleted: schema.dateCompleted?.toDate() ?? null,
    };
  }
}
