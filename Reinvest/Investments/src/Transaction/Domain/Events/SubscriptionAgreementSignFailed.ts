import { TransactionId } from "../ValueObject/TransactionId";
import { AbstractTransactionEvent } from "./TransactionEvent";

export class SubscriptionAgreementSignFailed extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
