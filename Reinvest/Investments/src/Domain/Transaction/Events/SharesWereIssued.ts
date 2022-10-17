import {AbstractTransactionEvent} from "./TransactionEvent";
import {TransactionId} from "../ValueObject/TransactionId";
import {SharesId} from "../../Commons/SharesId";

export class SharesWereIssued extends AbstractTransactionEvent {
    private readonly _sharesId: SharesId;

    constructor(transactionId: TransactionId, sharesId: SharesId) {
        super(transactionId);
        this._sharesId = sharesId;
    }

    get sharesId(): SharesId {
        return this._sharesId;
    }
}