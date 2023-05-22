import { Money } from 'Money/Money';

export type TradeConfiguration = {
  accountId: string;
  amount: number;
  bankAccountId: string;
  fees: number;
  investmentId: string;
  ip: string;
  portfolioId: string;
  profileId: string;
  subscriptionAgreementId: string;
};
export type VendorsConfiguration = {
  accountEmail: string;
  allocationId: string;
  bankAccountName: string;
  northCapitalAccountId: string;
  offeringId: string;
  unitSharePrice: number;
};

export type NorthCapitalTradeState = {
  tradeDate: string;
  tradeId: string;
  tradePrice: string;
  tradeShares: string;
  tradeStatus: 'CREATED';
};

export type VertaloDistributionState = {
  amount: string;
  createdOn: string;
  distributionId: string;
  status: string;
};

export type FundsMoveState = {
  referenceNumber: string;
  status: string;
};

export type TradeSchema = {
  fundsMoveState: FundsMoveState | null;
  investmentId: string;
  northCapitalTradeState: NorthCapitalTradeState | null;
  tradeConfiguration: TradeConfiguration;
  vendorsConfiguration: VendorsConfiguration | null;
  vertaloDistributionState: VertaloDistributionState | null;
};

export class Trade {
  private readonly amount: Money;
  private readonly fees: Money;
  private unitSharePrice: Money | null;
  private shares: string | null;

  constructor(private tradeSchema: TradeSchema) {
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
    };
  }

  setVendorsConfiguration(vendorsConfiguration: VendorsConfiguration) {
    this.tradeSchema.vendorsConfiguration = vendorsConfiguration;
    this.unitSharePrice = new Money(vendorsConfiguration.unitSharePrice);
    this.shares = this.calculateShares(this.amount, this.unitSharePrice);
  }

  setTradeState(tradeState: NorthCapitalTradeState) {
    this.tradeSchema.northCapitalTradeState = tradeState;
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
      northCapitalAccountId: this.tradeSchema.vendorsConfiguration!.northCapitalAccountId,
      offeringId: this.tradeSchema.vendorsConfiguration!.offeringId,
      shares: this.shares,
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
      accountId: this.tradeSchema.vendorsConfiguration!.northCapitalAccountId,
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

  private calculateShares(amount: Money, unitSharePrice: Money): string {
    const shares = amount.divideByAmount(unitSharePrice, 9);

    return shares.toString();
  }

  private getTotalTransferAmount(): Money {
    const amount = this.amount.add(this.fees);

    return amount;
  }
}
