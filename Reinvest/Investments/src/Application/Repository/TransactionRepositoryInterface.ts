import { TransactionProcessManager } from 'Investments/Application/TransactionProcessManager/TransactionProcessManager';
import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';

export interface TransactionRepositoryInterface {
  restoreTransaction(investmentId: string): Promise<TransactionProcessManager>;

  saveEvent(event: TransactionEvent): Promise<void>;
}
