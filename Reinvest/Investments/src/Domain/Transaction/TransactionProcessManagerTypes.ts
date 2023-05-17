import { TransactionDecision } from 'Investments/Domain/Transaction/TransactionDecisions';
import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';

export type TransactionEventsList = {
  list: TransactionEvent[];
};

export type TransactionState = {
  decision: TransactionDecision;
  events: TransactionEventsList;
  investmentId: string;
};

export interface TransactionProcessManagerTypes {
  canBeUpdated(): boolean;

  getTransactionState(): TransactionState;

  handleEvent(event: TransactionEvent | TransactionEvent[]): void;

  makeDecision(): TransactionDecision;
}
