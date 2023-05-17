import { TransactionDecision, TransactionDecisions } from 'Investments/Domain/Transaction/TransactionDecisions';
import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';
import { TransactionProcessManagerTypes, TransactionState } from 'Investments/Domain/Transaction/TransactionProcessManagerTypes';

export class TransactionProcessManager implements TransactionProcessManagerTypes {
  canBeUpdated(): boolean {
    return true;
  }

  getTransactionState(): TransactionState {
    return {
      decision: this.makeDecision(),
      events: { list: [] },
      investmentId: '',
    };
  }

  handleEvent(event: TransactionEvent | TransactionEvent[]): void {
    console.log(event);
  }

  makeDecision(): TransactionDecision {
    return {
      date: new Date(),
      kind: TransactionDecisions.CREATE_TRADE,
      decisionId: 1,
      state: {},
    };
  }
}
