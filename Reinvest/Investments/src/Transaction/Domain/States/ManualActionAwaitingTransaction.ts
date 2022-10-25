import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionId} from "../ValueObject/TransactionId";
import {CommonTransaction} from "./CommonTransaction";
import {TransactionState} from "../ValueObject/TransactionState";
import {TransactionResumed} from "../Events/TransactionResumed";
import {TransactionStateChange} from "../TransactionStateChange";
import {ResumeLastEvent} from "../Command/ResumeLastEvent";
import {TransactionCancelled} from "../Events/TransactionCancelled";
import {FailureCompletionReason} from "../ValueObject/FailureCompletionReason";
import {TransactionForcedToQuit} from "../Events/TransactionForcedToQuit";

export class ManualActionAwaitingTransaction extends CommonTransaction implements Transaction {
    private readonly lastTransactionState: TransactionState;

    constructor(transactionId: TransactionId, lastTransactionState: TransactionState) {
        super(transactionId);
        this.lastTransactionState = lastTransactionState;
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof TransactionResumed:
                return this.republishLastEvent();
            case event instanceof TransactionCancelled:
                return this.cancelTrade();
            case event instanceof TransactionForcedToQuit:
                return this.completeInvestmentWithFailure(FailureCompletionReason.TransactionForcedManuallyToQuit);
            default:
                return super.execute(event);
        }
    }

    private republishLastEvent() {
        return new TransactionDecision(
            ResumeLastEvent.create(this.transactionId, this.lastTransactionState),
            TransactionStateChange.changeBackToState(this.transactionId, this.lastTransactionState)
        )
    }
}