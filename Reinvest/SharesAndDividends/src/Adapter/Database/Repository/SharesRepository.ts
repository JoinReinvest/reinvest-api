import { SharesAndDividendsDatabaseAdapterProvider } from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';

export class SharesRepository {
  private databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: SharesAndDividendsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'SharesRepository';
}
