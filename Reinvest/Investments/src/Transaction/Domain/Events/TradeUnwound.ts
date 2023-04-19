import { TransactionId } from '../ValueObject/TransactionId';
import { AbstractTransactionEvent } from './TransactionEvent';

export class TradeUnwound extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
