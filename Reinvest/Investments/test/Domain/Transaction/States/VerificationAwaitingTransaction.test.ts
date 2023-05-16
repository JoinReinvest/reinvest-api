import { expect } from 'chai';
import { DisburseTrade } from 'Reinvest/Investments/src/Domain/Command/DisburseTrade';
import { DoNothing } from 'Reinvest/Investments/src/Domain/Command/DoNothing';
import { GracePeriodEnded } from 'Reinvest/Investments/src/Domain/Events/GracePeriodEnded';
import { InvestmentVerified } from 'Reinvest/Investments/src/Domain/Events/InvestmentVerified';
import { InvestorVerified } from 'Reinvest/Investments/src/Domain/Events/InvestorVerified';
import { VerificationAwaitingTransaction } from 'Reinvest/Investments/src/Domain/States/VerificationAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { GracePeriodStatus } from 'Reinvest/Investments/src/Domain/ValueObject/GracePeriodStatus';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';
import { InvestmentVerificationStatus, InvestorVerificationStatus } from 'Reinvest/Investments/src/Domain/ValueObject/VerificationStatus';

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
