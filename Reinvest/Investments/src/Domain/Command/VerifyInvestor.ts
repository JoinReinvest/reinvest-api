import { TransactionId } from '../ValueObject/TransactionId';
import { TransactionCommand } from './TransactionCommand';

export class VerifyInvestor implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this._transactionId = transactionId;
  }

  static create(transactionId: TransactionId) {
    return new VerifyInvestor(transactionId);
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }
}
