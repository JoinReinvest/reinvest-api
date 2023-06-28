import { UUID } from 'HKEKTypes/Generics';
import { PortfolioDatabaseAdapterProvider, propertyTable } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { Property, PropertySchema } from 'Reinvest/Portfolio/src/Domain/Property';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class PortfolioRepository {
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;
  private eventsPublisher: SimpleEventBus;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  public static getClassName = (): string => 'PortfolioRepository';

  async getById(id: number) {
    try {
      const propertyData = await this.databaseAdapterProvider
        .provide()
        .selectFrom(propertyTable)
        .selectAll()
        .where('id', '=', id)
        .castTo<PropertySchema>()
        .executeTakeFirst();

      if (!propertyData) {
        return null;
      }

      const property = Property.create(propertyData);

      return property;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async getAll(portfolioId: UUID) {
    try {
      const propertiesData = await this.databaseAdapterProvider
        .provide()
        .selectFrom(propertyTable)
        .selectAll()
        .where('portfolioId', '=', portfolioId)
        .castTo<PropertySchema>()
        .execute();

      if (!propertiesData.length) {
        return null;
      }

      const properties = propertiesData.map(property => Property.create(property));

      return properties;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async createProperty(property: Property) {
    const { id, portfolioId, status, lastUpdate, dataJson, adminJson, dealpathJson } = property.toObject();

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(propertyTable)
        .values({
          id,
          portfolioId,
          lastUpdate,
          status,
          dataJson: JSON.stringify(dataJson),
          adminJson: JSON.stringify(adminJson),
          dealpathJson: JSON.stringify(dealpathJson),
        })
        .execute();

      return true;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async updateProperty(property: Property, events?: DomainEvent[]): Promise<void> {
    const { id, dataJson, adminJson, dealpathJson, status } = property.toObject();

    await this.databaseAdapterProvider
      .provide()
      .updateTable(propertyTable)
      .set({
        dataJson: JSON.stringify(dataJson),
        adminJson: JSON.stringify(adminJson),
        dealpathJson: JSON.stringify(dealpathJson),
        status,
        lastUpdate: new Date(),
      })
      .where('id', '=', id)
      .execute();

    if (events?.length) {
      await this.publishEvents(events);
    }
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }
}
