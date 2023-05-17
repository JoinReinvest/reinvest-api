import { AbstractTransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class FailedPayment extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
