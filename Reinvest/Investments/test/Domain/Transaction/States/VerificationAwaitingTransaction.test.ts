import { expect } from 'chai';
import { DisburseTrade } from 'Investments/Domain/TransactionModeled/Command/DisburseTrade';
import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { GracePeriodEnded } from 'Investments/Domain/TransactionModeled/Events/GracePeriodEnded';
import { InvestmentVerified } from 'Investments/Domain/TransactionModeled/Events/InvestmentVerified';
import { InvestorVerified } from 'Investments/Domain/TransactionModeled/Events/InvestorVerified';
import { VerificationAwaitingTransaction } from 'Investments/Domain/TransactionModeled/States/VerificationAwaitingTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { GracePeriodStatus } from 'Investments/Domain/TransactionModeled/ValueObject/GracePeriodStatus';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';
import { InvestmentVerificationStatus, InvestorVerificationStatus } from 'Investments/Domain/TransactionModeled/ValueObject/VerificationStatus';

context('Given the payment was successful and awaiting for the verification of the investor and investment', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new VerificationAwaitingTransaction(
    transactionId,
    InvestorVerificationStatus.Unverified,
    InvestmentVerificationStatus.Unverified,
    GracePeriodStatus.Ongoing,
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
