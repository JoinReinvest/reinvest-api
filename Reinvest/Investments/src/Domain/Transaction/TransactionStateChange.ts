import {TransactionStep} from "./TransactionStep";

export class TransactionStateChange {
    private status: TransactionStep;

    constructor(status: TransactionStep) {
        this.status = status;
    }

    public static noChange() {
        return new TransactionStateChange(TransactionStep.Same);
    }


}