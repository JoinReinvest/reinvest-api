import { CreateTrade } from 'Investments/Domain/TransactionModeled/Command/CreateTrade';
import { TransactionCreated } from 'Investments/Domain/TransactionModeled/Events/TransactionCreated';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

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
