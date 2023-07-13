import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { navTable, PortfolioDatabaseAdapterProvider } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { PortfolioNavTable } from 'Portfolio/Adapter/Database/PortfolioDatabaseSchema';
import { Nav, NavSchema } from 'Portfolio/Domain/Nav';

export class PortfolioNavRepository {
  public static getClassName = (): string => 'PortfolioNavRepository';
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  async getTheLatestNav(portfolioId: UUID): Promise<Nav | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(navTable)
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

  async store(nav: Nav): Promise<boolean> {
    const values = this.castToTable(nav);
    try {
      await this.databaseAdapterProvider.provide().insertInto(navTable).values(values).execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store nav details`, error);

      return false;
    }
  }

  private castToObject(tableData: PortfolioNavTable): Nav {
    return Nav.restore(<NavSchema>{
      ...tableData,
      dateSynchronization: DateTime.from(tableData.dateSynchronization),
      unitPrice: Money.lowPrecision(tableData.unitPrice),
    });
  }

  private castToTable(object: Nav): PortfolioNavTable {
    const data = object.toObject();

    return <PortfolioNavTable>{
      ...data,
      dateSynchronization: data.dateSynchronization.toDate(),
      unitPrice: data.unitPrice.getAmount(),
    };
  }
}
