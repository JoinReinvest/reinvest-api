import { TransactionId } from '../ValueObject/TransactionId';
import { AbstractTransactionEvent } from './TransactionEvent';

export class SubscriptionAgreementSigned extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
