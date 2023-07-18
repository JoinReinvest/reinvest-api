import {
  portfolioAuthorsTable,
  PortfolioDatabaseAdapterProvider, updatesTable
} from 'Portfolio/Adapter/Database/DatabaseAdapter';
import console from 'console';
import { PortfolioAuthorsTable } from 'Portfolio/Adapter/Database/PropertyTable';
import {PortfolioAuthor, PortfolioAuthorSchema} from 'Portfolio/Domain/PortfolioAuthor';
import {PortfolioUpdate, PortfolioUpdateSchema} from "Portfolio/Domain/PortfolioUpdate";

export class PortfolioAuthorsRepository {
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'PortfolioAuthorsRepository';

  async add(portfolioAuthor: PortfolioAuthor) {
    const values = this.castToTable(portfolioAuthor);

    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(portfolioAuthorsTable)
        .values(values)
        .onConflict(oc => oc.column('id').doNothing())
        .execute();

      return true;
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  async delete(id: string) {
    try {
      await this.databaseAdapterProvider.provide().deleteFrom(portfolioAuthorsTable).where('id', '=', id).execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot delete portfolio author: ${error.message}`, error);

      return false;
    }
  }

  async getAll() {
    try {
      const portfolioAuthorsData = await this.databaseAdapterProvider.provide().selectFrom(portfolioAuthorsTable).selectAll().castTo<PortfolioAuthorSchema>().execute();

      if (!portfolioAuthorsData.length) {
        return null;
      }

      return portfolioAuthorsData.map(property => PortfolioAuthor.create(property));
    } catch (error: any) {
      console.error(error);

      return false;
    }
  }

  private castToTable(object: PortfolioAuthor): PortfolioAuthorsTable {
    const data = object.toObject();

    return <PortfolioAuthorsTable>{
      ...data,
    };
  }
}
