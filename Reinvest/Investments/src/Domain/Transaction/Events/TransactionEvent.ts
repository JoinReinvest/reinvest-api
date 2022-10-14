import {TransactionId} from "../ValueObject/TransactionId";

export interface TransactionEvent {
    transactionEventGuard: boolean;

    getTransactionId(): TransactionId;
}

export abstract class AbstractTransactionEvent implements TransactionEvent {
    public transactionEventGuard = true;
    protected readonly transactionId: TransactionId;

    constructor(transactionId: TransactionId) {
        this.transactionId = transactionId;
    }

    getTransactionId(): TransactionId {
        return this.transactionId;
    }

}

