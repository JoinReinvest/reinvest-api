import {PortfolioDatabaseAdapterProvider, updatesTable} from 'Portfolio/Adapter/Database/DatabaseAdapter';
import {PortfolioUpdate, PortfolioUpdateSchema} from "Portfolio/Domain/PortfolioUpdate";

export class PortfolioUpdatesRepository {
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider) {
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
          .castTo<PortfolioUpdateSchema>()
          .execute();

      if (!updatesData.length) {
        return null;
      }

      return updatesData.map(property => PortfolioUpdate.create(property));
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
