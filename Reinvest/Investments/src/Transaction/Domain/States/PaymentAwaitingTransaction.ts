import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {DoNothing} from "../Command/DoNothing";
import {TransactionId} from "../ValueObject/TransactionId";
import {CommonTransaction} from "./CommonTransaction";
import {FailureCompletionReason} from "../ValueObject/FailureCompletionReason";
import {SuccessfulPayment} from "../Events/SuccessfulPayment";
import {FailedPayment} from "../Events/FailedPayment";
import {TransactionCancelled} from "../Events/TransactionCancelled";
import {VerifyInvestor} from "../Command/VerifyInvestor";

export class PaymentAwaitingTransaction extends CommonTransaction implements Transaction {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof SuccessfulPayment:
                return this.verifyInvestor(event as SuccessfulPayment);
            case event instanceof FailedPayment:
                return super.cancelTrade(FailureCompletionReason.PaymentFailed);
            case event instanceof TransactionCancelled:
                return this.cancelTrade();
            default:
                return super.execute(event);
        }
    }

    private verifyInvestor(event: SuccessfulPayment): TransactionDecision {
        return new TransactionDecision(
            VerifyInvestor.create(this.transactionId),
            TransactionStateChange.verificationAwaiting(this.transactionId)
        )
    }
}