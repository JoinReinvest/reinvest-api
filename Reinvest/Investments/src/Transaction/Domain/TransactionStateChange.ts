import { Counter } from '../../Commons/Counter';
import { SharesId } from '../../Commons/SharesId';
import { FailureCompletionReason } from './ValueObject/FailureCompletionReason';
import { GracePeriodStatus } from './ValueObject/GracePeriodStatus';
import { ManualActionReason } from './ValueObject/ManualActionReason';
import { NumberOfShares } from './ValueObject/NumberOfShares';
import { TransactionId } from './ValueObject/TransactionId';
import { TransactionState } from './ValueObject/TransactionState';
import { UnitPrice } from './ValueObject/UnitPrice';
import { InvestmentVerificationStatus, InvestorVerificationStatus } from './ValueObject/VerificationStatus';

export type TransactionMetadata = {
  failureReason?: FailureCompletionReason;
  gracePeriodStatus?: GracePeriodStatus;
  investmentVerificationStatus?: InvestmentVerificationStatus;
  investorVerificationStatus?: InvestorVerificationStatus;
  lastActionRetryCounter?: Counter;
  manualActionReason?: ManualActionReason;
  numberOfShares?: NumberOfShares;
  sharesId?: SharesId;
  unitPrice?: UnitPrice;
  unwindReason?: FailureCompletionReason;
};

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

  static signingSubscriptionAgreementAwaiting(transactionId: TransactionId, unitPrice: UnitPrice, numberOfShares: NumberOfShares) {
    const state = new TransactionStateChange(transactionId, TransactionState.SigningSubscriptionAwaiting);
    state._metadata.unitPrice = unitPrice;
    state._metadata.numberOfShares = numberOfShares;
    state._metadata.lastActionRetryCounter = Counter.init();

    return state;
  }

  public static retrySigningSubscriptionAgreementAwaiting(transactionId: TransactionId, signingSubscriptionAgreementCounter: Counter): TransactionStateChange {
    const state = new TransactionStateChange(transactionId, TransactionState.Same);
    state._metadata.lastActionRetryCounter = signingSubscriptionAgreementCounter;

    return state;
  }

  public static fundsTransferAwaiting(transactionId: TransactionId): TransactionStateChange {
    const state = new TransactionStateChange(transactionId, TransactionState.FundsTransferAwaiting);
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

  public static verificationAwaiting(transactionId: TransactionId): TransactionStateChange {
    return new TransactionStateChange(transactionId, TransactionState.VerificationAwaiting);
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
    state._metadata.lastActionRetryCounter = Counter.init();
    state._metadata.failureReason = reason;

    return state;
  }

  static completeWithSuccess(transactionId: TransactionId, sharesId: SharesId) {
    const state = new TransactionStateChange(transactionId, TransactionState.CompletedWithSuccess);
    state._metadata.sharesId = sharesId;

    return state;
  }

  static verificationStatus(
    transactionId: TransactionId,
    goToState: TransactionState,
    investorVerificationStatus: InvestorVerificationStatus,
    investmentVerificationStatus: InvestmentVerificationStatus,
    gracePeriodStatus: GracePeriodStatus,
  ) {
    const state = new TransactionStateChange(transactionId, goToState);
    state._metadata.investorVerificationStatus = investorVerificationStatus;
    state._metadata.investmentVerificationStatus = investmentVerificationStatus;
    state._metadata.gracePeriodStatus = gracePeriodStatus;

    return state;
  }

  static tradeUnwindAwaiting(transactionId: TransactionId, reason: FailureCompletionReason) {
    const state = new TransactionStateChange(transactionId, TransactionState.TradeUnwindAwaiting);
    state._metadata.lastActionRetryCounter = Counter.init();
    state._metadata.unwindReason = reason;

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
