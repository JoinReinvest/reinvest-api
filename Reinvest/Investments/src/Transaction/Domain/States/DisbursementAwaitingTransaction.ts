import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {TransactionId} from "../ValueObject/TransactionId";
import {CommonTransaction} from "./CommonTransaction";
import {IssueShares} from "../Command/IssueShares";
import {TradeDisbursed} from "../Events/TradeDisbursed";


export class DisbursementAwaitingTransaction extends CommonTransaction implements Transaction {

    constructor(transactionId: TransactionId,) {
        super(transactionId);
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof TradeDisbursed:
                return this.issueShares();
            default:
                return super.execute(event);
        }
    }

    private issueShares(): TransactionDecision {
        return new TransactionDecision(
            IssueShares.create(),
            TransactionStateChange.sharesIssuanceAwaiting(this.transactionId)
        )
    }
}