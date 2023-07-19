import { JSONObjectOf, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { WithdrawalsDocuments } from 'Reinvest/Withdrawals/src/Domain/WithdrawalsDocuments';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';
import { TemplateContentType } from 'Templates/Types';
import { WithdrawalsDatabaseAdapterProvider, withdrawalsDocumentsTable } from 'Withdrawals/Adapter/Database/DatabaseAdapter';

import { WithdrawalsDocumentsTable } from '../WithdrawalsSchema';

export class WithdrawalsDocumentsRepository {
  private databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: WithdrawalsDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'WithdrawalsDocumentsRepository';

  async create(withdrawalDocument: WithdrawalsDocuments) {
    const schema = this.castToTable(withdrawalDocument);

    try {
      await this.databaseAdapterProvider.provide().insertInto(withdrawalsDocumentsTable).values(schema).execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create withdrawal document: ${error.message}`, error);

      return false;
    }
  }

  async update(withdrawalDocument: WithdrawalsDocuments) {
    const schema = this.castToTable(withdrawalDocument);

    try {
      await this.databaseAdapterProvider.provide().updateTable(withdrawalsDocumentsTable).set(schema).where('id', '=', schema.id).execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot create withdrawal document: ${error.message}`, error);

      return false;
    }
  }

  async getById(id: UUID): Promise<WithdrawalsDocuments | null> {
    const withdrawalsDocuments = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsDocumentsTable)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!withdrawalsDocuments) {
      return null;
    }

    return this.castToObject(withdrawalsDocuments);
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  private castToObject(data: WithdrawalsDocumentsTable): WithdrawalsDocuments {
    return WithdrawalsDocuments.create({
      ...data,
      contentFieldsJson: <TemplateContentType>data.contentFieldsJson,
      dateCreated: DateTime.from(data.dateCreated),
      dateCompleted: data.dateCompleted ? DateTime.from(data.dateCompleted) : null,
      pdfDateCreated: data.pdfDateCreated ? DateTime.from(data.pdfDateCreated) : null,
    });
  }

  private castToTable(object: WithdrawalsDocuments): WithdrawalsDocumentsTable {
    const schema = object.toObject();

    return {
      ...schema,
      contentFieldsJson: schema.contentFieldsJson as JSONObjectOf<TemplateContentType>,
      dateCreated: schema.dateCreated.toDate(),
      dateCompleted: schema.dateCompleted?.toDate() || null,
      pdfDateCreated: schema.pdfDateCreated?.toDate() || null,
    };
  }
}
