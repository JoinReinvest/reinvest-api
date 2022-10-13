import {TransactionStatus} from "./TransactionStatus";

export class TransactionStateChange {
    private status: TransactionStatus;

    constructor(status: TransactionStatus) {
        this.status = status;
    }

    public static noChange() {
        return new TransactionStateChange(TransactionStatus.Same);
    }


}