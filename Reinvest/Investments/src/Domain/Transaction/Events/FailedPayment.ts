import {AbstractTransactionEvent} from "./TransactionEvent";
import {TransactionId} from "../ValueObject/TransactionId";

export class FailedPayment extends AbstractTransactionEvent {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }
}