import { InvestmentsDatabaseAdapterProvider } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';

export class FeesRepository {
  public static getClassName = (): string => 'FeesRepository';

  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }
}
