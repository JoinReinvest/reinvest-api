import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { ReinvestmentProcessManager } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentProcessManager';
import { ReinvestmentRepositoryInterface } from 'Investments/Application/Repository/ReinvestmentRepositoryInterface';
import { ReinvestmentEvent } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { InvestmentsDatabaseAdapterProvider, reinvestmentEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { ReinvestmentEventsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

export class ReinvestmentRepository implements ReinvestmentRepositoryInterface {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;
  private iGenerator: IdGeneratorInterface;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider, iGenerator: IdGeneratorInterface) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.iGenerator = iGenerator;
  }

  public static getClassName = (): string => 'ReinvestmentRepository';

  async restoreReinvestment(dividendId: string): Promise<ReinvestmentProcessManager> {
    const events = await this.getReinvestmentEvents(dividendId);
    const reinvestmentEvents = events.map(
      (event): ReinvestmentEvent => ({
        kind: event.eventKind,
        data: event.eventStateJson,
        date: event.dateCreated,
        id: event.dividendId,
      }),
    );

    return new ReinvestmentProcessManager(dividendId, reinvestmentEvents);
  }

  async saveEvent(event: ReinvestmentEvent): Promise<void> {
    await this.databaseAdapterProvider
      .provide()
      .insertInto(reinvestmentEventsTable)
      .values({
        dividendId: event.id,
        eventKind: event.kind,
        eventStateJson: event.data,
        dateCreated: new Date(),
        id: this.iGenerator.createUuid(),
      })
      .execute();
  }

  private async getReinvestmentEvents(dividendId: string): Promise<ReinvestmentEventsTable[]> {
    return await this.databaseAdapterProvider
      .provide()
      .selectFrom(reinvestmentEventsTable)
      .select(['id', 'dividendId', 'dateCreated', 'eventKind', 'eventStateJson'])
      .where('dividendId', '=', dividendId)
      .orderBy('dateCreated', 'asc')
      .execute();
  }
}
