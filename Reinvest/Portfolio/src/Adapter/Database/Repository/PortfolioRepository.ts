import { PortfolioDatabaseAdapterProvider } from 'Portfolio/Adapter/Database/DatabaseAdapter';

export class PortfolioRepository {
  private databaseAdapterProvider: PortfolioDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: PortfolioDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'PortfolioRepository';
}
