import { TransactionDecision } from 'Investments/Domain/Transaction/TransactionDecisions';
import { TransactionEvent } from 'Investments/Domain/Transaction/TransactionEvents';

export interface TransactionProcessManagerTypes {
  canBeUpdated(): boolean;

  handleEvent(event: TransactionEvent): void;

  makeDecision(): TransactionDecision;
}
