import { UUID } from 'HKEKTypes/Generics';
import { PortfolioDatabaseAdapterProvider, portfolioTable } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { PortfolioTable } from 'Portfolio/Adapter/Database/PortfolioDatabaseSchema';
import { Portfolio, PortfolioSchema } from 'Portfolio/Domain/Portfolio';

export class PortfolioRepository {
  public static getClassName = (): string => 'PortfolioRepository';
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async getById(portfolioId: UUID): Promise<Portfolio | null> {
    const data = await this.databaseAdapterProvider.provide().selectFrom(portfolioTable).selectAll().where('id', '=', portfolioId).executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async store(portfolio: Portfolio): Promise<boolean> {
    const values = this.castToTable(portfolio);
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(portfolioTable)
        .values(values)
        .onConflict(oc =>
          oc.constraint('id').doUpdateSet({
            linkToOfferingCircular: eb => eb.ref(`excluded.linkToOfferingCircular`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store portfolio details`, error);

      return false;
    }
  }

  private castToObject(tableData: PortfolioTable): Portfolio {
    return Portfolio.restore(<PortfolioSchema>{
      ...tableData,
    });
  }

  private castToTable(object: Portfolio): PortfolioTable {
    const data = object.toObject();

    return <PortfolioTable>{
      ...data,
    };
  }

  async getActivePortfolio() {
    const data = await this.databaseAdapterProvider.provide().selectFrom(portfolioTable).selectAll().where('status', '=', 'ACTIVE').executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }
}
