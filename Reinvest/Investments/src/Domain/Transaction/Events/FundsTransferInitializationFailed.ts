import {AbstractTransactionEvent} from "./TransactionEvent";
import {TransactionId} from "../ValueObject/TransactionId";

export class FundsTransferInitializationFailed extends AbstractTransactionEvent {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }
}