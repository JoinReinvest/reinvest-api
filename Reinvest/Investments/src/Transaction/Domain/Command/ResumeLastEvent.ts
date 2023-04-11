import { TransactionId } from '../ValueObject/TransactionId';
import { TransactionState } from '../ValueObject/TransactionState';
import { TransactionCommand } from './TransactionCommand';

export class ResumeLastEvent implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;
  private readonly _state: TransactionState;

  constructor(transactionId: TransactionId, state: TransactionState) {
    this._transactionId = transactionId;
    this._state = state;
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }

  get state(): TransactionState {
    return this._state;
  }

  static create(transactionId: TransactionId, state: TransactionState) {
    return new ResumeLastEvent(transactionId, state);
  }
}
