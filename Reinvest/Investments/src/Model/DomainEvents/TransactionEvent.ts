export interface TransactionEvent {
    transactionEventGuard: boolean;
}

export abstract class AbstractTransactionEvent implements TransactionEvent {
    public transactionEventGuard = true;
}

