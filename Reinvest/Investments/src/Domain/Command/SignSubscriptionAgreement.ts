import { TransactionId } from '../ValueObject/TransactionId';
import { TransactionCommand } from './TransactionCommand';

export class SignSubscriptionAgreement implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this._transactionId = transactionId;
  }

  static create(transactionId: TransactionId) {
    return new SignSubscriptionAgreement(transactionId);
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }
}
