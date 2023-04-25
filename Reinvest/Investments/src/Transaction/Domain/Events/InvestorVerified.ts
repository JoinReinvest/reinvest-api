import { TransactionId } from '../ValueObject/TransactionId';
import { AbstractTransactionEvent } from './TransactionEvent';

export class InvestorVerified extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
