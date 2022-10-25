import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {TransactionId} from "../ValueObject/TransactionId";
import {CommonTransaction} from "./CommonTransaction";
import {GracePeriodEnded} from "../Events/GracePeriodEnded";
import {InvestmentVerificationStatus, InvestorVerificationStatus} from "../ValueObject/VerificationStatus";
import {GracePeriodStatus} from "../ValueObject/GracePeriodStatus";
import {TransactionState} from "../ValueObject/TransactionState";
import {InvestorVerified} from "../Events/InvestorVerified";
import {InvestmentVerified} from "../Events/InvestmentVerified";
import {DoNothing} from "../Command/DoNothing";
import {DisburseTrade} from "../Command/DisburseTrade";
import {TransactionCancelled} from "../Events/TransactionCancelled";

export class VerificationAwaitingTransaction extends CommonTransaction implements Transaction {
    private investorVerificationStatus: InvestorVerificationStatus;
    private investmentVerificationStatus: InvestmentVerificationStatus;
    private gracePeriodStatus: GracePeriodStatus;

    constructor(
        transactionId: TransactionId,
        investorVerificationStatus: InvestorVerificationStatus,
        investmentVerificationStatus: InvestmentVerificationStatus,
        gracePeriodStatus: GracePeriodStatus
    ) {
        super(transactionId);
        this.investmentVerificationStatus = investmentVerificationStatus;
        this.gracePeriodStatus = gracePeriodStatus;
        this.investorVerificationStatus = investorVerificationStatus;
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof GracePeriodEnded:
                return this.gracePeriodEnded();
            case event instanceof InvestorVerified:
                return this.investorVerified();
            case event instanceof InvestmentVerified:
                return this.investmentVerified();
            case event instanceof TransactionCancelled:
                return this.gracePeriodStatus === GracePeriodStatus.Ongoing
                    ? this.cancelTrade()
                    : this.justWait()
            default:
                return super.execute(event);
        }
    }

    private gracePeriodEnded(): TransactionDecision {
        this.gracePeriodStatus = GracePeriodStatus.Ended;

        return this.makeDecision();
    }

    private investorVerified(): TransactionDecision {
        this.investorVerificationStatus = InvestorVerificationStatus.Verified;

        return this.makeDecision();
    }

    private investmentVerified(): TransactionDecision {
        this.investmentVerificationStatus = InvestmentVerificationStatus.Verified;

        return this.makeDecision();
    }

    private makeDecision(): TransactionDecision {
        let goToStatus = TransactionState.Same;
        let actionToDo = DoNothing.create();
        if (
            this.investorVerificationStatus === InvestorVerificationStatus.Verified
            && this.investmentVerificationStatus === InvestmentVerificationStatus.Verified
            && this.gracePeriodStatus == GracePeriodStatus.Ended
        ) {
            goToStatus = TransactionState.TradeDisbursementAwaiting;
            actionToDo = DisburseTrade.create(this.transactionId);
        }

        return new TransactionDecision(
            actionToDo,
            TransactionStateChange.verificationStatus(
                this.transactionId,
                goToStatus,
                this.investorVerificationStatus,
                this.investmentVerificationStatus,
                this.gracePeriodStatus
            )
        )
    }
}