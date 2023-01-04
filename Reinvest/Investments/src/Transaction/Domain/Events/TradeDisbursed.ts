import { TransactionId } from "../ValueObject/TransactionId";
import { AbstractTransactionEvent } from "./TransactionEvent";

export class TradeDisbursed extends AbstractTransactionEvent {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }
}
