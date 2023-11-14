import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { navTable, PortfolioDatabaseAdapterProvider } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { PortfolioNavTable } from 'Portfolio/Adapter/Database/PropertyTable';
import { Nav, NavSchema } from 'Portfolio/Domain/Nav';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class PortfolioNavRepository {
  public static getClassName = (): string => 'PortfolioNavRepository';
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;
  private eventBus: EventBus;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider, eventBus: EventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventBus = eventBus;
  }

  async getTheLatestNav(portfolioId: UUID): Promise<Nav | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(navTable)
      .selectAll()
      .where('portfolioId', '=', portfolioId)
      .orderBy('dateUpdated', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async store(nav: Nav, events: DomainEvent[] = []): Promise<boolean> {
    const values = this.castToTable(nav);
    try {
      await this.databaseAdapterProvider.provide().insertInto(navTable).values(values).execute();

      if (events.length > 0) {
        await this.eventBus.publishMany(events);
      }

      return true;
    } catch (error: any) {
      console.error(`Cannot store nav details`, error);

      return false;
    }
  }

  private castToObject(tableData: PortfolioNavTable): Nav {
    return Nav.restore(<NavSchema>{
      ...tableData,
      dateUpdated: DateTime.from(tableData.dateUpdated),
      // @ts-ignore
      unitNav: Money.lowPrecision(parseInt(tableData.unitNav, 10)),
    });
  }

  private castToTable(object: Nav): PortfolioNavTable {
    const data = object.toObject();

    return <PortfolioNavTable>{
      ...data,
      dateUpdated: data.dateUpdated.toDate(),
      unitNav: data.unitNav.getAmount(),
    };
  }

  async getNavHistory(portfolioId: string): Promise<Nav[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(navTable)
      .selectAll()
      .where('portfolioId', '=', portfolioId)
      .orderBy('dateUpdated', 'desc')
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data.map(nav => this.castToObject(nav));
  }
}
