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

  async store(withdrawalDocument: WithdrawalsDocuments) {
    const schema = this.castToTable(withdrawalDocument);

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(withdrawalsDocumentsTable)
        .values(schema)
        .onConflict(oc =>
          oc.column('id').doUpdateSet({
            status: eb => eb.ref(`excluded.status`),
            pdfDateCreated: eb => eb.ref(`excluded.pdfDateCreated`),
          }),
        )
        .execute();

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
    return WithdrawalsDocuments.restore({
      ...data,
      contentFieldsJson: <TemplateContentType>data.contentFieldsJson,
      dateCreated: DateTime.from(data.dateCreated),
      pdfDateCreated: data.pdfDateCreated ? DateTime.from(data.pdfDateCreated) : null,
    });
  }

  private castToTable(object: WithdrawalsDocuments): WithdrawalsDocumentsTable {
    const schema = object.toObject();

    return {
      ...schema,
      contentFieldsJson: schema.contentFieldsJson as JSONObjectOf<TemplateContentType>,
      dateCreated: schema.dateCreated.toDate(),
      pdfDateCreated: schema.pdfDateCreated?.toDate() || null,
    };
  }

  async getGeneratedDocuments(withdrawalId: UUID): Promise<UUID[]> {
    const documents = await this.databaseAdapterProvider
      .provide()
      .selectFrom(withdrawalsDocumentsTable)
      .select(['id'])
      .where('withdrawalId', '=', withdrawalId)
      .where('pdfDateCreated', 'is not', null)
      .execute();

    if (!documents.length) {
      return [];
    }

    return documents.map(document => document.id);
  }
}
