import { IssueShares } from '../Command/IssueShares';
import { TradeDisbursed } from '../Events/TradeDisbursed';
import { TransactionEvent } from '../Events/TransactionEvent';
import { Transaction } from '../Transaction';
import { TransactionDecision } from '../TransactionDecision';
import { TransactionStateChange } from '../TransactionStateChange';
import { TransactionId } from '../ValueObject/TransactionId';
import { CommonTransaction } from './CommonTransaction';

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
