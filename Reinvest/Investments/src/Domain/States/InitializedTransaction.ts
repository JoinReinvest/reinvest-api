import { CreateTrade } from '../Command/CreateTrade';
import { TransactionCreated } from '../Events/TransactionCreated';
import { TransactionEvent } from '../Events/TransactionEvent';
import { Transaction } from '../Transaction';
import { TransactionDecision } from '../TransactionDecision';
import { TransactionStateChange } from '../TransactionStateChange';
import { TransactionId } from '../ValueObject/TransactionId';
import { CommonTransaction } from './CommonTransaction';

export class InitializedTransaction extends CommonTransaction implements Transaction {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TransactionCreated:
        return this.createTrade(event as TransactionCreated);
      default:
        return super.execute(event);
    }
  }

  private createTrade(event: TransactionCreated): TransactionDecision {
    return new TransactionDecision(
      CreateTrade.create(this.transactionId, event.portfolioId, event.investorAccountId, event.amountToInvest),
      TransactionStateChange.tradeAwaiting(this.transactionId),
    );
  }
}
