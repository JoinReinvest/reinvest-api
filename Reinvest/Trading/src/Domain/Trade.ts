import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { TradeVerification, TradeVerificationState } from 'Trading/Domain/TradeVerification';
import { OrderStatus, TradeStatus } from 'Trading/IntegrationLogic/NorthCapitalTypes';

export type TradeConfiguration = {
  accountId: string;
  amount: number;
  bankAccountId: string;
  fees: number;
  investmentId: string;
  ip: string;
  parentId: string;
  portfolioId: string;
  profileId: string;
  subscriptionAgreementId: string;
  userTradeId: string;
};
export type VendorsConfiguration = {
  accountEmail: string;
  allocationId: string;
  bankAccountName: string;
  northCapitalAccountId: string | null; // can be null if beneficiary
  northCapitalParentAccountId: string;
  offeringId: string;
  parentEmail: string;
  unitSharePrice: number;
};

export type NorthCapitalTradeState = {
  tradeDate: string;
  tradeId: string;
  tradePrice: string;
  tradeShares: string;
  tradeStatus: 'CREATED' | 'FUNDED' | 'SETTLED' | 'CANCELED' | 'UNWIND PENDING' | 'UNWIND SETTLED';
  tradeVerification: TradeVerificationState;
  paymentMismatchTradeRemoved?: {
    date: string;
    details: any;
    status: string;
    tradeId: string;
  };
};

export type VertaloDistributionState = {
  amount: string;
  createdOn: string;
  distributionId: string;
  status: 'drafted' | 'open' | 'closed';
};

export type FundsMoveState = {
  accountId: string;
  paymentId: string;
  status: string;
};

export type SubscriptionAgreementState = {
  status: boolean;
  subscriptionAgreementId: string;
};

export type TradeSummary = {
  amount: number;
  fees: number;
  shares: number;
  unitSharePrice: number;
};

export type DisbursementState = {
  completedDate: Date | null;
  markedDate: Date | null;
  status: 'MARKED' | 'COMPLETED';
};

export type SharesTransferState = {
  holdingId: string;
  transferDate: Date;
};

export type VertaloPaymentState = {
  paymentId: string;
  paymentMarkedDate: Date;
};

export type CancelTradeState = {
  cancelDate: Date;
  cancelState: any;
  originalCancelStatus: OrderStatus;
};

export type TradeSchema = {
  cancelTradeState: CancelTradeState | null;
  disbursementState: DisbursementState | null;
  fundsMoveState: FundsMoveState | null;
  investmentId: string;
  northCapitalTradeState: NorthCapitalTradeState | null;
  retryPaymentState: FundsMoveState | null;
  sharesTransferState: SharesTransferState | null;
  subscriptionAgreementState: SubscriptionAgreementState | null;
  tradeConfiguration: TradeConfiguration;
  tradeId: string | null;
  vendorsConfiguration: VendorsConfiguration | null;
  vertaloDistributionState: VertaloDistributionState | null;
  vertaloPaymentState: VertaloPaymentState | null;
};

export class Trade {
  private readonly amount: Money;
  private readonly fees: Money;
  private tradeSchema: TradeSchema;
  private unitSharePrice: Money | null;
  private shares: number | null;
  private tradeStatus: TradeStatus;

  constructor(tradeSchema: TradeSchema) {
    this.tradeSchema = tradeSchema;
    const { amount, fees } = this.tradeSchema.tradeConfiguration;
    const unitSharePrice = this.tradeSchema.vendorsConfiguration?.unitSharePrice;

    this.unitSharePrice = unitSharePrice ? new Money(unitSharePrice) : null;
    this.amount = new Money(amount);
    this.fees = new Money(fees);

    this.shares = this.unitSharePrice ? this.calculateShares(this.amount, this.unitSharePrice) : null;
    this.tradeStatus = TradeStatus.fromResponse(this.tradeSchema.northCapitalTradeState ? this.tradeSchema.northCapitalTradeState?.tradeStatus : null);
  }

  static create(tradeSchema: TradeSchema) {
    return new Trade(tradeSchema);
  }

  getInternalIds() {
    return {
      accountId: this.tradeSchema.tradeConfiguration.accountId,
      portfolioId: this.tradeSchema.tradeConfiguration.portfolioId,
      bankAccountId: this.tradeSchema.tradeConfiguration.bankAccountId,
      parentId: this.tradeSchema.tradeConfiguration.parentId,
    };
  }

  setVendorsConfiguration(vendorsConfiguration: VendorsConfiguration) {
    this.tradeSchema.vendorsConfiguration = vendorsConfiguration;
    this.unitSharePrice = new Money(vendorsConfiguration.unitSharePrice);
    this.shares = this.calculateShares(this.amount, this.unitSharePrice);
  }

  updateUnitSharePrice(unitSharePrice: number) {
    if (!this.tradeSchema.vendorsConfiguration) {
      throw new Error('Vendors configuration is not set');
    }

    this.tradeSchema.vendorsConfiguration.unitSharePrice = unitSharePrice;
    this.unitSharePrice = new Money(unitSharePrice);
    this.shares = this.calculateShares(this.amount, this.unitSharePrice);
  }

  setTradeState(tradeState: NorthCapitalTradeState) {
    this.tradeSchema.northCapitalTradeState = tradeState;
    this.tradeStatus = TradeStatus.fromResponse(tradeState.tradeStatus);
    this.tradeSchema.tradeId = tradeState.tradeId;
  }

  isVendorsConfigurationSet() {
    return this.tradeSchema.vendorsConfiguration !== null;
  }

  getSchema(): TradeSchema {
    return this.tradeSchema;
  }

  getInvestmentId() {
    return this.tradeSchema.investmentId;
  }

  tradeExists(): boolean {
    return this.tradeStatus.isSet();
  }

  getTradeToDelete(): {
    ncAccountId: string;
    tradeId: string;
  } {
    return {
      ncAccountId: this.tradeSchema.vendorsConfiguration!.northCapitalParentAccountId,
      tradeId: this.tradeSchema.northCapitalTradeState!.tradeId,
    };
  }

  getNorthCapitalTradeConfiguration(): {
    ip: string;
    northCapitalAccountId: string;
    offeringId: string;
    shares: string;
  } {
    if (!this.shares) {
      throw new Error('Shares are not calculated');
    }

    return {
      ip: this.tradeSchema.tradeConfiguration.ip,
      northCapitalAccountId: this.tradeSchema.vendorsConfiguration!.northCapitalParentAccountId,
      offeringId: this.tradeSchema.vendorsConfiguration!.offeringId,
      shares: this.shares.toString(),
    };
  }

  isVertaloDistributionCreated() {
    return this.tradeSchema.vertaloDistributionState !== null;
  }

  getVertaloDistributionConfiguration() {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    return {
      allocationId: this.tradeSchema.vendorsConfiguration!.allocationId,
      investorEmail: this.tradeSchema.vendorsConfiguration!.accountEmail,
      numberOfShares: this.tradeSchema.northCapitalTradeState!.tradeShares,
    };
  }

  getInvestorEmail() {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    return this.tradeSchema.vendorsConfiguration!.parentEmail;
  }

  setVertaloDistributionState(vertaloDistribution: VertaloDistributionState) {
    this.tradeSchema.vertaloDistributionState = vertaloDistribution;
  }

  isFundsTransferCreated() {
    return this.tradeSchema.fundsMoveState !== null;
  }

  getFundsTransferConfiguration(): {
    amount: Money;
    bankName: string;
    fee: Money;
    investmentId: string;
    ip: string;
    ncAccountId: string;
    offeringId: string;
    tradeId: string;
    userTradeId: string; // the nice one
  } {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    const amount = this.getTotalTransferAmount();

    return {
      investmentId: this.tradeSchema.investmentId,
      ncAccountId: this.tradeSchema.vendorsConfiguration!.northCapitalParentAccountId,
      offeringId: this.tradeSchema.vendorsConfiguration!.offeringId,
      tradeId: this.tradeSchema.northCapitalTradeState!.tradeId,
      bankName: this.tradeSchema.vendorsConfiguration!.bankAccountName,
      amount: amount,
      fee: this.fees,
      ip: this.tradeSchema.tradeConfiguration.ip,
      userTradeId: this.tradeSchema.tradeConfiguration?.userTradeId,
    };
  }

  setFundsTransferState(fundsTransfer: FundsMoveState) {
    this.tradeSchema.fundsMoveState = fundsTransfer;
  }

  isSubscriptionAgreementUploaded() {
    return this.tradeSchema.subscriptionAgreementState !== null;
  }

  getSubscriptionAgreementConfiguration(): { profileId: string; subscriptionAgreementId: string; tradeId: string } {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    return {
      profileId: this.tradeSchema.tradeConfiguration.profileId,
      subscriptionAgreementId: this.tradeSchema.tradeConfiguration.subscriptionAgreementId,
      tradeId: this.tradeSchema.northCapitalTradeState!.tradeId,
    };
  }

  setSubscriptionAgreementState(subscriptionAgreementState: SubscriptionAgreementState) {
    this.tradeSchema.subscriptionAgreementState = subscriptionAgreementState;
  }

  isVertaloDistributionDrafted() {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    return this.tradeSchema.vertaloDistributionState.status === 'drafted';
  }

  getVertaloDistribution(): { distributionId: string } {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    return {
      distributionId: this.tradeSchema.vertaloDistributionState.distributionId,
    };
  }

  getVertaloDistributionPaymentDetails(): { amount: string; distributionId: string } {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    return {
      distributionId: this.tradeSchema.vertaloDistributionState.distributionId,
      amount: new Money(this.tradeSchema.tradeConfiguration.amount).toUnit().toString(),
    };
  }

  updateVertaloDistributionStatus(newStatus: 'open' | 'closed') {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    this.tradeSchema.vertaloDistributionState.status = newStatus;
  }

  getTradeSummary(): TradeSummary {
    if (this.isVertaloDistributionDrafted()) {
      throw new Error('Vertalo distribution is not opened');
    }

    return {
      amount: this.amount.getAmount(),
      fees: this.fees.getAmount(),
      shares: this.shares!,
      unitSharePrice: this.unitSharePrice!.getAmount(),
    };
  }

  isTradeAwaitingFunding(): boolean {
    if (this.tradeSchema.northCapitalTradeState === null || this.tradeSchema.fundsMoveState === null) {
      throw new Error('Trade state is not set');
    }

    return this.tradeStatus.isCreated();
  }

  getTradeId(): string {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    return this.tradeSchema.northCapitalTradeState!.tradeId;
  }

  setTradeStatusToFunded() {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    this.tradeSchema.northCapitalTradeState!.tradeStatus = 'FUNDED';
    this.tradeStatus = TradeStatus.fromResponse('FUNDED');
  }

  isVertaloDistributionOpened(): boolean {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    return this.tradeSchema.vertaloDistributionState.status === 'open';
  }

  isTradeFunded(): boolean {
    return this.tradeStatus.isFunded();
  }

  isMarkedReadyToDisbursement() {
    if (!this.tradeSchema.disbursementState) {
      return false;
    }

    return this.tradeSchema.disbursementState.status === 'MARKED';
  }

  setDisbursementStateAsMarked() {
    this.tradeSchema.disbursementState = {
      status: 'MARKED',
      markedDate: DateTime.now().toDate(),
      completedDate: null,
    };
  }

  setDisbursementStateAsCompleted() {
    if (!this.tradeSchema.disbursementState) {
      throw new Error('Disbursement state is not set');
    }

    this.tradeSchema.disbursementState.status = 'COMPLETED';
    this.tradeSchema.disbursementState.completedDate = DateTime.now().toDate();
  }

  isTradeSettled(): boolean {
    return this.tradeStatus.isSettled();
  }

  setTradeStatusToSettled() {
    if (!this.tradeExists()) {
      throw new Error('North Capital trade state is not set');
    }

    this.tradeSchema.northCapitalTradeState!.tradeStatus = 'SETTLED';
    this.tradeStatus = TradeStatus.fromResponse('SETTLED');
  }

  isPaymentMarkedInVertalo(): boolean {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    if (this.tradeSchema.vertaloPaymentState === null) {
      return false;
    }

    return true;
  }

  setVertaloPaymentState(paymentId: string) {
    this.tradeSchema.vertaloPaymentState = {
      paymentMarkedDate: DateTime.now().toDate(),
      paymentId,
    };
  }

  isSharesTransferredInVertalo(): boolean {
    if (!this.tradeSchema.vertaloPaymentState) {
      throw new Error('Vertalo payment state is not set');
    }

    if (!this.tradeSchema.sharesTransferState) {
      return false;
    }

    return true;
  }

  setVertaloSharesTransferState(holdingId: string) {
    this.tradeSchema.sharesTransferState = {
      holdingId,
      transferDate: DateTime.now().toDate(),
    };
  }

  private calculateShares(amount: Money, unitSharePrice: Money): number {
    const shares = amount.divideByMoney(unitSharePrice);

    return shares;
  }

  private getTotalTransferAmount(): Money {
    const amount = this.amount.add(this.fees);

    return amount;
  }

  getTradeVerification(): TradeVerification {
    return new TradeVerification(this.tradeSchema.northCapitalTradeState?.tradeVerification);
  }

  storeTradeVerification(tradeVerification: TradeVerification) {
    this.tradeSchema.northCapitalTradeState!.tradeVerification = tradeVerification.toObject();
  }

  getAccountIdForVerification() {
    return this.tradeSchema.tradeConfiguration.parentId;
  }

  getProfileId(): UUID {
    return this.tradeSchema.tradeConfiguration.profileId;
  }

  setTradeCancelState(status: string, cancelState: any) {
    this.tradeSchema.cancelTradeState = {
      cancelState,
      originalCancelStatus: status as OrderStatus,
      cancelDate: DateTime.now().toDate(),
    };
    this.tradeStatus = TradeStatus.fromResponse(status);
    // @ts-ignore
    this.tradeSchema.northCapitalTradeState!.tradeStatus = status;
  }

  isCanceled(): boolean {
    return this.tradeStatus.isCanceled();
  }

  isTradeUnwinding() {
    return this.tradeStatus.isUnwindPending();
  }

  setTradeUnwounded() {
    this.tradeSchema.northCapitalTradeState!.tradeStatus = 'UNWIND SETTLED';
    this.tradeStatus = TradeStatus.fromResponse(OrderStatus.UNWIND_SETTLED);
  }

  getReinvestAccountId(): UUID {
    return this.tradeSchema.tradeConfiguration.accountId;
  }

  isPaymentMismatched(): boolean {
    const investmentAmount = this.amount;
    const tradePrice = this.tradeSchema.northCapitalTradeState?.tradePrice;

    if (!tradePrice) {
      return false;
    }

    const amountToPay = Money.lowPrecision(Math.round(parseFloat(tradePrice) * 100));
    const diff = amountToPay.subtract(investmentAmount).getAmount();

    if (diff != 0) {
      // if diff is more/less than 0 cents then there is a mismatch
      return true;
    }

    return false;
  }

  getUnitPrice() {
    return this.unitSharePrice?.getFormattedAmount();
  }

  setRemoveTradeDetails(removeDetails: { details: any; status: string }, tradeId: string) {
    this.tradeSchema.northCapitalTradeState!.paymentMismatchTradeRemoved = {
      details: removeDetails.details,
      status: removeDetails.status,
      date: DateTime.now().toIsoDateTime(),
      tradeId,
    };
  }

  getNorthCapitalPayment(): {
    ncAccountId: string;
    paymentId: string;
  } | null {
    if (!this.tradeSchema.fundsMoveState?.paymentId) {
      return null;
    }

    let paymentId = this.tradeSchema.fundsMoveState!.paymentId;

    if (this.isPaymentRetried()) {
      paymentId = this.tradeSchema.retryPaymentState!.paymentId;
    }

    return {
      ncAccountId: this.tradeSchema.fundsMoveState!.accountId,
      paymentId,
    };
  }

  isPaymentRetried(): boolean {
    return this.tradeSchema.retryPaymentState !== null;
  }

  setPaymentRetried(retryPaymentState: FundsMoveState): void {
    this.tradeSchema.retryPaymentState = retryPaymentState;
  }
}
