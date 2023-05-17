import { TransactionRepositoryInterface } from 'Investments/Application/Repository/TransactionRepositoryInterface';
import { TransactionProcessManager } from 'Investments/Application/TransactionProcessManager/TransactionProcessManager';
import { InvestmentsDatabaseAdapterProvider } from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';

export class TransactionRepository implements TransactionRepositoryInterface {
  private databaseAdapterProvider: InvestmentsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: InvestmentsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'TransactionRepository';

  async restoreTransaction(investmentId: string): Promise<TransactionProcessManager> {
    return new TransactionProcessManager();
  }

  async saveTransaction(transaction: TransactionProcessManager): Promise<void> {}
}
