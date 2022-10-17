import {AbstractTransactionEvent} from "./TransactionEvent";
import {TransactionId} from "../ValueObject/TransactionId";

export class SuccessfulPayment extends AbstractTransactionEvent {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }
}