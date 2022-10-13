import {Result} from "../../Commons/Result";
import {TransactionEvent} from "../../../Model/DomainEvents/TransactionEvent";

export interface TransactionRepositoryInterface {
    transactionRepositoryInterfaceGuard: boolean;

    publish(event: TransactionEvent): Promise<Result>;
}


