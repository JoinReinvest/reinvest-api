import {TransactionStep} from "./TransactionStep";
import {TransactionId} from "./ValueObject/TransactionId";
import {NumberOfShares} from "./ValueObject/NumberOfShares";
import {UnitPrice} from "./ValueObject/UnitPrice";
import {Counter} from "../Commons/Counter";

export type TransactionMetadata = {
    unitPrice: UnitPrice | undefined,
    numberOfShares: NumberOfShares | undefined,
    numberOfTradeCreateRetries: Counter | undefined
}

export class TransactionStateChange {
    private readonly _status: TransactionStep;
    private readonly _transactionId: TransactionId;
    private readonly _metadata: TransactionMetadata;

    constructor(transactionId: TransactionId, status: TransactionStep) {
        this._transactionId = transactionId;
        this._status = status;
        this._metadata = {} as TransactionMetadata;
    }

    get transactionId(): TransactionId {
        return this._transactionId;
    }

    get status(): TransactionStep {
        return this._status;
    }

    get metadata(): TransactionMetadata {
        return this._metadata;
    }

    public static noChange(transactionId: TransactionId): TransactionStateChange {
        return new TransactionStateChange(transactionId, TransactionStep.Same);
    }

    public static tradeCreated(transactionId: TransactionId, unitPrice: UnitPrice, numberOfShares: NumberOfShares): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionStep.TradeCreated);
        state._metadata.unitPrice = unitPrice;
        state._metadata.numberOfShares = numberOfShares;
        state._metadata.numberOfTradeCreateRetries = Counter.init();

        return state;
    }

    public static tradeCreatedRetry(transactionId: TransactionId, numberOfTradeCreateRetries: Counter): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionStep.Same);
        state._metadata.numberOfTradeCreateRetries = numberOfTradeCreateRetries;

        return state;
    }

    public static fundsTransferInitiated(transactionId: TransactionId): TransactionStateChange {
        return new TransactionStateChange(transactionId, TransactionStep.FundsTransferInitiated);
    }

    static waitingForManualAction(transactionId: TransactionId) {
        return new TransactionStateChange(transactionId, TransactionStep.WaitForManualAction);
    }
}