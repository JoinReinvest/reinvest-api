import { IssueShares } from 'Investments/Domain/TransactionModeled/Command/IssueShares';
import { TradeDisbursed } from 'Investments/Domain/TransactionModeled/Events/TradeDisbursed';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class DisbursementAwaitingTransaction extends CommonTransaction implements Transaction {
  constructor(transactionId: TransactionId) {
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
    return new TransactionDecision(IssueShares.create(), TransactionStateChange.sharesIssuanceAwaiting(this.transactionId));
  }
}
