import { TransactionEvent } from './Events/TransactionEvent';
import { TransactionDecision } from './TransactionDecision';

export interface Transaction {
  execute(event: TransactionEvent): TransactionDecision;

  transactionGuard: boolean;
}
