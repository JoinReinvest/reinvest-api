import { TransactionId } from '../ValueObject/TransactionId';
import { TransactionCommand } from './TransactionCommand';

export class DisburseTrade implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this._transactionId = transactionId;
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }

  static create(transactionId: TransactionId) {
    return new DisburseTrade(transactionId);
  }
}
