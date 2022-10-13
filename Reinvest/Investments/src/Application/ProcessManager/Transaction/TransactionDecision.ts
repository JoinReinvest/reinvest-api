import {TransactionCommand} from "./Command/TransactionCommand";
import {TransactionStateChange} from "./TransactionStateChange";

export class TransactionDecision {
    private command: TransactionCommand;
    private stateChange: TransactionStateChange;

    constructor(command: TransactionCommand, stateChange: TransactionStateChange) {
        this.command = command;
        this.stateChange = stateChange;
    }

}