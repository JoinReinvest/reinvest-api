import { TransactionProcessManager } from 'Investments/Application/TransactionProcessManager/TransactionProcessManager';

export interface TransactionRepositoryInterface {
  restoreTransaction(investmentId: string): Promise<TransactionProcessManager>;

  saveTransaction(transaction: TransactionProcessManager): Promise<void>;
}
