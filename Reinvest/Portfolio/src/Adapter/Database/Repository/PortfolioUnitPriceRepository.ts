import { UUID } from "HKEKTypes/Generics";
import { DateTime } from "Money/DateTime";
import { Money } from "Money/Money";
import { PortfolioDatabaseAdapterProvider, unitPriceTable } from "Portfolio/Adapter/Database/DatabaseAdapter";
import { PortfolioUnitPriceTable } from "Portfolio/Adapter/Database/PropertyTable";
import { EventBus } from "SimpleAggregator/EventBus/EventBus";
import { DomainEvent } from "SimpleAggregator/Types";
import { UnitPrice, UnitPriceSchema } from "Portfolio/Domain/UnitPrice";

export class PortfolioUnitPriceRepository {
  public static getClassName = (): string => 'PortfolioUnitPriceRepository';
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;
  private eventBus: EventBus;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider, eventBus: EventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventBus = eventBus;
  }

  async getTheLatestUnitPrice(portfolioId: UUID): Promise<UnitPrice | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(unitPriceTable)
      .selectAll()
      .where('portfolioId', '=', portfolioId)
      .orderBy('dateSynchronization', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async store(unitPrice: UnitPrice, events: DomainEvent[] = []): Promise<boolean> {
    const values = this.castToTable(unitPrice);
    try {
      await this.databaseAdapterProvider.provide().insertInto(unitPriceTable).values(values).execute();

      if (events.length > 0) {
        await this.eventBus.publishMany(events);
      }

      return true;
    } catch (error: any) {
      console.error(`Cannot store unitPrice details`, error);

      return false;
    }
  }

  private castToObject(tableData: PortfolioUnitPriceTable): UnitPrice {
    return UnitPrice.restore(<UnitPriceSchema>{
      ...tableData,
      dateSynchronization: DateTime.from(tableData.dateSynchronization),
      // @ts-ignore
      unitPrice: Money.lowPrecision(parseInt(tableData.unitPrice, 10)),
    });
  }

  private castToTable(object: UnitPrice): PortfolioUnitPriceTable {
    const data = object.toObject();

    return <PortfolioUnitPriceTable>{
      ...data,
      dateSynchronization: data.dateSynchronization.toDate(),
      unitPrice: data.unitPrice.getAmount(),
    };
  }

  async getUnitPriceHistory(portfolioId: string): Promise<UnitPrice[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(unitPriceTable)
      .selectAll()
      .where('portfolioId', '=', portfolioId)
      .orderBy('dateSynchronization', 'desc')
      .execute();

    if (data.length === 0) {
      return [];
    }

    return data.map(unitPrice => this.castToObject(unitPrice));
  }
}
