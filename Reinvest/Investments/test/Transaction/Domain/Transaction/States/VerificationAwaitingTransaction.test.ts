import {expect} from "chai";

import {TransactionDecision} from "../../../../../src/Transaction/Domain/TransactionDecision";
import {TransactionState} from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import {TransactionId} from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import {
    VerificationAwaitingTransaction
} from "../../../../../src/Transaction/Domain/States/VerificationAwaitingTransaction";
import {GracePeriodEnded} from "../../../../../src/Transaction/Domain/Events/GracePeriodEnded";
import {
    InvestmentVerificationStatus,
    InvestorVerificationStatus
} from "../../../../../src/Transaction/Domain/ValueObject/VerificationStatus";
import {GracePeriodStatus} from "../../../../../src/Transaction/Domain/ValueObject/GracePeriodStatus";
import {DoNothing} from "../../../../../src/Transaction/Domain/Command/DoNothing";
import {InvestorVerified} from "../../../../../src/Transaction/Domain/Events/InvestorVerified";
import {InvestmentVerified} from "../../../../../src/Transaction/Domain/Events/InvestmentVerified";
import {DisburseTrade} from "../../../../../src/Transaction/Domain/Command/DisburseTrade";

context('Given the payment was successful and awaiting for the verification of the investor and investment', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new VerificationAwaitingTransaction(
        transactionId,
        InvestorVerificationStatus.Unverified,
        InvestmentVerificationStatus.Unverified,
        GracePeriodStatus.Ongoing
    );
    describe('When the grace period ended', () => {
        const gracePeriodEnded = new GracePeriodEnded(transactionId);

        it('Then the transaction should note it and waits for other verifications', async () => {
            const decision: TransactionDecision = transaction.execute(gracePeriodEnded);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.Same);
            expect(decision.stateChange.metadata.gracePeriodStatus).is.equal(GracePeriodStatus.Ended);
            expect(decision.stateChange.metadata.investorVerificationStatus).is.equal(InvestorVerificationStatus.Unverified);
            expect(decision.stateChange.metadata.investmentVerificationStatus).is.equal(InvestmentVerificationStatus.Unverified);
        });
    });

    describe('And when the investor is verified', () => {
        const investorVerified = new InvestorVerified(transactionId);

        it('Then the transaction should note it and waits for investment verification', async () => {
            const decision: TransactionDecision = transaction.execute(investorVerified);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.Same);
            expect(decision.stateChange.metadata.gracePeriodStatus).is.equal(GracePeriodStatus.Ended);
            expect(decision.stateChange.metadata.investorVerificationStatus).is.equal(InvestorVerificationStatus.Verified);
            expect(decision.stateChange.metadata.investmentVerificationStatus).is.equal(InvestmentVerificationStatus.Unverified);
        });
    });

    describe('And when the investment is verified', () => {
        const investmentVerified = new InvestmentVerified(transactionId);

        it('Then the transaction should request trade disbursement', async () => {
            const decision: TransactionDecision = transaction.execute(investmentVerified);

            expect(decision.command).is.instanceof(DisburseTrade);
            expect(decision.stateChange.status).is.equal(TransactionState.TradeDisbursementAwaiting);
            expect(decision.stateChange.metadata.gracePeriodStatus).is.equal(GracePeriodStatus.Ended);
            expect(decision.stateChange.metadata.investorVerificationStatus).is.equal(InvestorVerificationStatus.Verified);
            expect(decision.stateChange.metadata.investmentVerificationStatus).is.equal(InvestmentVerificationStatus.Verified);
        });
    });
});