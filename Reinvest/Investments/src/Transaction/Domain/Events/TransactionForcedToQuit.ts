import { TransactionId } from "../ValueObject/TransactionId";
import { AbstractTransactionEvent } from "./TransactionEvent";

export class TransactionForcedToQuit extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
