import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';

export interface Transaction {
  execute(event: TransactionEvent): TransactionDecision;

  transactionGuard: boolean;
}
