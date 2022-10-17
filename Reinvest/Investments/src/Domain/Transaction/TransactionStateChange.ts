import {TransactionState} from "./ValueObject/TransactionState";
import {TransactionId} from "./ValueObject/TransactionId";
import {NumberOfShares} from "./ValueObject/NumberOfShares";
import {UnitPrice} from "./ValueObject/UnitPrice";
import {Counter} from "../Commons/Counter";
import {ManualActionReason} from "./ValueObject/ManualActionReason";
import {FailureCompletionReason} from "./ValueObject/FailureCompletionReason";

export type TransactionMetadata = {
    unitPrice: UnitPrice | undefined,
    numberOfShares: NumberOfShares | undefined,
    lastActionRetryCounter: Counter | undefined,
    manualActionReason: ManualActionReason | undefined,
    failureReason: FailureCompletionReason | undefined
}

export class TransactionStateChange {
    private readonly _status: TransactionState;
    private readonly _transactionId: TransactionId;
    private readonly _metadata: TransactionMetadata;

    constructor(transactionId: TransactionId, status: TransactionState) {
        this._transactionId = transactionId;
        this._status = status;
        this._metadata = {} as TransactionMetadata;
    }

    get transactionId(): TransactionId {
        return this._transactionId;
    }

    get status(): TransactionState {
        return this._status;
    }

    get metadata(): TransactionMetadata {
        return this._metadata;
    }

    public static noChange(transactionId: TransactionId): TransactionStateChange {
        return new TransactionStateChange(transactionId, TransactionState.Same);
    }

    public static tradeAwaiting(transactionId: TransactionId): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionState.TradeAwaiting);
        state._metadata.lastActionRetryCounter = Counter.init();

        return state;
    }

    public static retryTradeAwaiting(transactionId: TransactionId, tradeCreationCounter: Counter): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionState.Same);
        state._metadata.lastActionRetryCounter = tradeCreationCounter;

        return state;
    }

    public static fundsTransferAwaiting(transactionId: TransactionId, unitPrice: UnitPrice, numberOfShares: NumberOfShares): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionState.FundsTransferAwaiting);
        state._metadata.unitPrice = unitPrice;
        state._metadata.numberOfShares = numberOfShares;
        state._metadata.lastActionRetryCounter = Counter.init();

        return state;
    }

    public static retryFundsTransferAwaiting(transactionId: TransactionId, fundsTransferInitializationCounter: Counter): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionState.Same);
        state._metadata.lastActionRetryCounter = fundsTransferInitializationCounter;

        return state;
    }

    public static paymentAwaiting(transactionId: TransactionId): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, TransactionState.PaymentAwaiting);
        state._metadata.lastActionRetryCounter = Counter.init();

        return state;
    }

    public static cancellationPeriodEndAwaiting(transactionId: TransactionId): TransactionStateChange {
        return new TransactionStateChange(transactionId, TransactionState.CancellationPeriodEndAwaiting);
    }

    public static sharesIssuanceAwaiting(transactionId: TransactionId): TransactionStateChange {
        return new TransactionStateChange(transactionId, TransactionState.SharesIssuanceAwaiting);
    }

    static waitingForManualAction(transactionId: TransactionId, reason: ManualActionReason) {
        const state = new TransactionStateChange(transactionId, TransactionState.ManualActionAwaiting);
        state._metadata.manualActionReason = reason;

        return state;
    }

    static waitingForAdminManualAction(transactionId: TransactionId, reason: ManualActionReason) {
        const state = new TransactionStateChange(transactionId, TransactionState.AdminManualActionAwaiting);
        state._metadata.manualActionReason = reason;

        return state;
    }


    static completeWithFailure(transactionId: TransactionId, reason: FailureCompletionReason) {
        const state = new TransactionStateChange(transactionId, TransactionState.CompletedWithFailure);
        state._metadata.failureReason = reason;

        return state;
    }

    static completeWithSuccess(transactionId: TransactionId) {
        return new TransactionStateChange(transactionId, TransactionState.CompletedWithSuccess);
    }

    static tradeUnwindAwaiting(transactionId: TransactionId) {
        const state = new TransactionStateChange(transactionId, TransactionState.TradeUnwindAwaiting);
        state._metadata.lastActionRetryCounter = Counter.init();

        return state;
    }

    static retryTradeUnwindAwaiting(transactionId: TransactionId, retryCounter: Counter) {
        const state = new TransactionStateChange(transactionId, TransactionState.Same);
        state._metadata.lastActionRetryCounter = retryCounter;

        return state;
    }

    public static changeBackToState(transactionId: TransactionId, previousState: TransactionState): TransactionStateChange {
        const state = new TransactionStateChange(transactionId, previousState);
        state._metadata.lastActionRetryCounter = Counter.init();

        return state;
    }
}