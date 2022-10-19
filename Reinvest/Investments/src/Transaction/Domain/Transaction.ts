import {TransactionEvent} from "./Events/TransactionEvent";
import {TransactionDecision} from "./TransactionDecision";

export interface Transaction {
    transactionGuard: boolean;

    execute(event: TransactionEvent): TransactionDecision
}