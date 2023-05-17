import { DisburseTrade } from 'Investments/Domain/TransactionModeled/Command/DisburseTrade';
import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { GracePeriodEnded } from 'Investments/Domain/TransactionModeled/Events/GracePeriodEnded';
import { InvestmentVerified } from 'Investments/Domain/TransactionModeled/Events/InvestmentVerified';
import { InvestorVerified } from 'Investments/Domain/TransactionModeled/Events/InvestorVerified';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { GracePeriodStatus } from 'Investments/Domain/TransactionModeled/ValueObject/GracePeriodStatus';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';
import { InvestmentVerificationStatus, InvestorVerificationStatus } from 'Investments/Domain/TransactionModeled/ValueObject/VerificationStatus';

export class VerificationAwaitingTransaction extends CommonTransaction implements Transaction {
  private investorVerificationStatus: InvestorVerificationStatus;
  private investmentVerificationStatus: InvestmentVerificationStatus;
  private gracePeriodStatus: GracePeriodStatus;

  constructor(
    transactionId: TransactionId,
    investorVerificationStatus: InvestorVerificationStatus,
    investmentVerificationStatus: InvestmentVerificationStatus,
    gracePeriodStatus: GracePeriodStatus,
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
        return this.gracePeriodStatus === GracePeriodStatus.Ongoing ? this.cancelTrade() : this.justWait();
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
      this.investorVerificationStatus === InvestorVerificationStatus.Verified &&
      this.investmentVerificationStatus === InvestmentVerificationStatus.Verified &&
      this.gracePeriodStatus == GracePeriodStatus.Ended
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
        this.gracePeriodStatus,
      ),
    );
  }
}
