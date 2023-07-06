import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { TransactionRepositoryInterface } from 'Investments/Application/Repository/TransactionRepositoryInterface';
import { TransactionProcessManager } from 'Investments/Application/TransactionProcessManager/TransactionProcessManager';
import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';
import { InvestmentsDatabaseAdapterProvider, transactionEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { TransactionEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { DateTime } from 'Money/DateTime';

export class TransactionRepository implements TransactionRepositoryInterface {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private iGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, iGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.iGenerator = iGenerator;
  }

  public static getClassName = (): string => 'TransactionRepository';

  async restoreTransaction(investmentId: string): Promise<TransactionProcessManager> {
    const events = await this.getTransactionEvents(investmentId);
    const transactionEvents = events.map(
      (event): TransactionEvent => ({
        kind: event.eventKind,
        data: event.eventStateJson,
        date: event.dateCreated,
        id: event.investmentId,
      }),
    );

    return new TransactionProcessManager(investmentId, transactionEvents);
  }

  async saveEvent(event: TransactionEvent): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .insertInto(transactionEventsTable)
      .values({
        investmentId: event.id,
        eventKind: event.kind,
        eventStateJson: event.data,
        dateCreated: DateTime.now().toDate(),
        id: this.iGenerator.createUuid(),
      })
      .execute();
  }

  private async getTransactionEvents(investmentId: string): Promise<TransactionEventsTable[]> {
    return await this.databaseAdapterProvider
      .provide()
      .selectFrom(transactionEventsTable)
      .select(['id', 'investmentId', 'dateCreated', 'eventKind', 'eventStateJson'])
      .where('investmentId', '=', investmentId)
      .orderBy('dateCreated', 'asc')
      .execute();
  }
}
