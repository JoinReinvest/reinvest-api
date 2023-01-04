import { TransactionCommand } from "./Command/TransactionCommand";
import { TransactionStateChange } from "./TransactionStateChange";

export class TransactionDecision {
  private readonly _command: TransactionCommand;
  private readonly _stateChange: TransactionStateChange;

  constructor(
    command: TransactionCommand,
    stateChange: TransactionStateChange
  ) {
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
