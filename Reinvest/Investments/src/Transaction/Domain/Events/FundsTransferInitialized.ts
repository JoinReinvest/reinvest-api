import { TransactionId } from "../ValueObject/TransactionId";
import { AbstractTransactionEvent } from "./TransactionEvent";

export class FundsTransferInitialized extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
