import {Result} from "../../Commons/Result";
import {TransactionEvent} from "./Events/TransactionEvent";

export interface TransactionRepositoryInterface {
    transactionRepositoryInterfaceGuard: boolean;

    publish(event: TransactionEvent): Promise<Result>;
}


