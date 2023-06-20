import { Money } from 'Money/Money';
import { TradeVerificationState, TradeVerificationStatus } from 'Trading/Domain/TradeVerification';

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
  tradeStatus: 'CREATED' | 'FUNDED' | 'SETTLED';
  tradeVerification: TradeVerificationState;
};

export type VertaloDistributionState = {
  amount: string;
  createdOn: string;
  distributionId: string;
  status: 'drafted' | 'open' | 'closed';
};

export type FundsMoveState = {
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

export type TradeSchema = {
  disbursementState: DisbursementState | null;
  fundsMoveState: FundsMoveState | null;
  investmentId: string;
  northCapitalTradeState: NorthCapitalTradeState | null;
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

  constructor(tradeSchema: TradeSchema) {
    this.tradeSchema = tradeSchema;
    const { amount, fees } = this.tradeSchema.tradeConfiguration;
    const unitSharePrice = this.tradeSchema.vendorsConfiguration?.unitSharePrice;

    this.unitSharePrice = unitSharePrice ? new Money(unitSharePrice) : null;
    this.amount = new Money(amount);
    this.fees = new Money(fees);

    this.shares = this.unitSharePrice ? this.calculateShares(this.amount, this.unitSharePrice) : null;
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

  setTradeState(tradeState: NorthCapitalTradeState) {
    this.tradeSchema.northCapitalTradeState = tradeState;
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

  isTradeCreated() {
    return this.tradeSchema.northCapitalTradeState !== null;
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
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    return {
      allocationId: this.tradeSchema.vendorsConfiguration!.allocationId,
      investorEmail: this.tradeSchema.vendorsConfiguration!.accountEmail,
      numberOfShares: this.tradeSchema.northCapitalTradeState!.tradeShares,
    };
  }

  setVertaloDistributionState(vertaloDistribution: VertaloDistributionState) {
    this.tradeSchema.vertaloDistributionState = vertaloDistribution;
  }

  isFundsTransferCreated() {
    return this.tradeSchema.fundsMoveState !== null;
  }

  getFundsTransferConfiguration(): {
    accountId: string;
    amount: Money;
    bankName: string;
    investmentId: string;
    ip: string;
    offeringId: string;
    tradeId: string;
  } {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    const amount = this.getTotalTransferAmount();

    return {
      investmentId: this.tradeSchema.investmentId,
      accountId: this.tradeSchema.vendorsConfiguration!.northCapitalParentAccountId,
      offeringId: this.tradeSchema.vendorsConfiguration!.offeringId,
      tradeId: this.tradeSchema.northCapitalTradeState.tradeId,
      bankName: this.tradeSchema.vendorsConfiguration!.bankAccountName,
      amount: amount,
      ip: this.tradeSchema.tradeConfiguration.ip,
    };
  }

  setFundsTransferState(fundsTransfer: FundsMoveState) {
    this.tradeSchema.fundsMoveState = fundsTransfer;
  }

  isSubscriptionAgreementUploaded() {
    return this.tradeSchema.subscriptionAgreementState !== null;
  }

  getSubscriptionAgreementConfiguration(): { profileId: string; subscriptionAgreementId: string; tradeId: string } {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    return {
      profileId: this.tradeSchema.tradeConfiguration.profileId,
      subscriptionAgreementId: this.tradeSchema.tradeConfiguration.subscriptionAgreementId,
      tradeId: this.tradeSchema.northCapitalTradeState.tradeId,
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

    if (!this.tradeSchema.northCapitalTradeState) {
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

    return this.tradeSchema.northCapitalTradeState!.tradeStatus === 'CREATED';
  }

  getTradeId(): string {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    return this.tradeSchema.northCapitalTradeState.tradeId;
  }

  setTradeStatusToFunded() {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    this.tradeSchema.northCapitalTradeState.tradeStatus = 'FUNDED';
  }

  isVertaloDistributionOpened(): boolean {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    return this.tradeSchema.vertaloDistributionState.status === 'open';
  }

  isTradeFunded(): boolean {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    return this.tradeSchema.northCapitalTradeState.tradeStatus === 'FUNDED';
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
      markedDate: new Date(),
      completedDate: null,
    };
  }

  setDisbursementStateAsCompleted() {
    if (!this.tradeSchema.disbursementState) {
      throw new Error('Disbursement state is not set');
    }

    this.tradeSchema.disbursementState.status = 'COMPLETED';
    this.tradeSchema.disbursementState.completedDate = new Date();
  }

  isTradeSettled(): boolean {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    return this.tradeSchema.northCapitalTradeState.tradeStatus === 'SETTLED';
  }

  setTradeStatusToSettled() {
    if (!this.tradeSchema.northCapitalTradeState) {
      throw new Error('North Capital trade state is not set');
    }

    this.tradeSchema.northCapitalTradeState.tradeStatus = 'SETTLED';
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
      paymentMarkedDate: new Date(),
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
      transferDate: new Date(),
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

  isTradeVerified() {
    const tradeVerification = this.tradeSchema.northCapitalTradeState?.tradeVerification;

    if (!tradeVerification) {
      return false;
    }

    return tradeVerification.status === TradeVerificationStatus.VERIFIED;
  }

  isTradeRejected() {
    const tradeVerification = this.tradeSchema.northCapitalTradeState?.tradeVerification;

    if (!tradeVerification) {
      return false;
    }

    return tradeVerification.status === TradeVerificationStatus.REJECTED;
  }

  getTradeVerificationState(): TradeVerificationState | undefined {
    return this.tradeSchema.northCapitalTradeState?.tradeVerification;
  }
}
