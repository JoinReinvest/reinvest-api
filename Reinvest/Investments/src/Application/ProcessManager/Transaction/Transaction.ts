import {TransactionEvent} from "../../../Model/DomainEvents/TransactionEvent";
import {TransactionDecision} from "./TransactionDecision";

export interface Transaction {
    transactionGuard: boolean;

    execute(event: TransactionEvent): TransactionDecision
}