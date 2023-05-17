import { InvestmentsDatabaseAdapterProvider } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';

export class InvestmentsRepository {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'InvestmentsRepository';
}
