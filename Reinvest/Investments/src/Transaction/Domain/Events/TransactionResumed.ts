import { TransactionId } from "../ValueObject/TransactionId";
import { AbstractTransactionEvent } from "./TransactionEvent";

export class TransactionResumed extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
