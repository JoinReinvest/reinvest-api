import {AbstractTransactionEvent} from "./TransactionEvent";
import {TransactionId} from "../ValueObject/TransactionId";

export class SharesWereIssued extends AbstractTransactionEvent {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }
}