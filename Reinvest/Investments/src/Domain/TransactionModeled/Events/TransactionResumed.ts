import { AbstractTransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class TransactionResumed extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
