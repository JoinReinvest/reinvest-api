import {TransactionCommand} from "./TransactionCommand";
import {TransactionId} from "../ValueObject/TransactionId";

export class DisburseTrade implements TransactionCommand {
    transactionCommandGuard: boolean = true;

    private readonly _transactionId: TransactionId;

    constructor(transactionId: TransactionId) {
        this._transactionId = transactionId;
    }

    static create(transactionId: TransactionId) {
        return new DisburseTrade(transactionId);
    }

    get transactionId(): TransactionId {
        return this._transactionId;
    }
}