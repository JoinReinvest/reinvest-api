import {PortfolioDatabaseAdapterProvider, updatesTable} from 'Portfolio/Adapter/Database/DatabaseAdapter';
import {SimpleEventBus} from 'SimpleAggregator/EventBus/EventBus';
import {Property, PropertySchema} from "Portfolio/Domain/Property";

export class PortfolioUpdatesRepository {
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider, eventsPublisher: SimpleEventBus) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'PortfolioUpdatesRepository';

  async add(portfolioId: string) {
    try {
      await this.databaseAdapterProvider
          .provide()
          .insertInto(updatesTable)
          .values({
            portfolioId,
          })
          .execute();

      return true;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async getAll() {
    try {
      const updatesData = await this.databaseAdapterProvider
          .provide()
          .selectFrom(updatesTable)
          .selectAll()
          .castTo<PropertySchema>()
          .execute();

      if (!updatesData.length) {
        return null;
      }

      const updates = updatesData.map(property => Property.create(property));

      return updates;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async delete(portfolioId: string) {
    try {
      await this.databaseAdapterProvider
          .provide()
          .deleteFrom(updatesTable)
          .where('portfolioId', '=', portfolioId)
          .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot delete portfolio update: ${error.message}`, error);

      return false;
    }
  }
}
