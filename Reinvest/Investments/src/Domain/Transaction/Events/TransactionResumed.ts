import {AbstractTransactionEvent} from "./TransactionEvent";
import {TransactionId} from "../ValueObject/TransactionId";

export class TransactionResumed extends AbstractTransactionEvent {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }
}