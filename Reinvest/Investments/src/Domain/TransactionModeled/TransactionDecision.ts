import { TransactionCommand } from 'Investments/Domain/TransactionModeled/Command/TransactionCommand';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';

export class TransactionDecision {
  private readonly _command: TransactionCommand;
  private readonly _stateChange: TransactionStateChange;

  constructor(command: TransactionCommand, stateChange: TransactionStateChange) {
    this._command = command;
    this._stateChange = stateChange;
  }

  get command(): TransactionCommand {
    return this._command;
  }

  get stateChange(): TransactionStateChange {
    return this._stateChange;
  }
}
