import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { SharesTransferState, VertaloDistributionState, VertaloPaymentState } from 'Trading/Domain/Trade';

export type ReinvestmentTradeConfiguration = {
  accountId: string;
  amount: number;
  dividendId: string;
  portfolioId: string;
  profileId: string;
};

export type ReinvestmentVendorsConfiguration = {
  accountEmail: string;
  allocationId: string;
  unitSharePrice: number;
};

export type ReinvestmentTradeSchema = {
  dividendId: string;
  sharesTransferState: SharesTransferState | null;
  tradeConfiguration: ReinvestmentTradeConfiguration;
  vendorsConfiguration: ReinvestmentVendorsConfiguration | null;
  vertaloDistributionState: VertaloDistributionState | null;
  vertaloPaymentState: VertaloPaymentState | null;
};

export type ReinvestmentTradeSummary = {
  amount: number;
  shares: number;
  unitSharePrice: number;
};

export class ReinvestmentTrade {
  private readonly amount: Money;
  private tradeSchema: ReinvestmentTradeSchema;
  private unitSharePrice: Money | null;
  private shares: number | null;

  constructor(tradeSchema: ReinvestmentTradeSchema) {
    this.tradeSchema = tradeSchema;
    const { amount } = this.tradeSchema.tradeConfiguration;
    const unitSharePrice = this.tradeSchema.vendorsConfiguration?.unitSharePrice;

    this.unitSharePrice = unitSharePrice ? new Money(unitSharePrice) : null;
    this.amount = new Money(amount);

    this.shares = this.unitSharePrice ? this.calculateShares(this.amount, this.unitSharePrice) : null;
  }

  static create(tradeSchema: ReinvestmentTradeSchema) {
    return new ReinvestmentTrade(tradeSchema);
  }

  getInternalIds() {
    return {
      accountId: this.tradeSchema.tradeConfiguration.accountId,
      portfolioId: this.tradeSchema.tradeConfiguration.portfolioId,
    };
  }

  setVendorsConfiguration(vendorsConfiguration: ReinvestmentVendorsConfiguration) {
    this.tradeSchema.vendorsConfiguration = vendorsConfiguration;
    this.unitSharePrice = new Money(vendorsConfiguration.unitSharePrice);
    this.shares = this.calculateShares(this.amount, this.unitSharePrice);
  }

  isVendorsConfigurationSet() {
    return this.tradeSchema.vendorsConfiguration !== null;
  }

  getSchema(): ReinvestmentTradeSchema {
    return this.tradeSchema;
  }

  isVertaloDistributionCreated() {
    return this.tradeSchema.vertaloDistributionState !== null;
  }

  getVertaloDistributionConfiguration() {
    if (!this.shares) {
      throw new Error('Shares are not set');
    }

    return {
      allocationId: this.tradeSchema.vendorsConfiguration!.allocationId,
      investorEmail: this.tradeSchema.vendorsConfiguration!.accountEmail,
      numberOfShares: this.shares.toString(),
    };
  }

  setVertaloDistributionState(vertaloDistribution: VertaloDistributionState) {
    this.tradeSchema.vertaloDistributionState = vertaloDistribution;
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

  getTradeSummary(): ReinvestmentTradeSummary {
    if (!this.isSharesTransferredInVertalo()) {
      throw new Error('Shares are not transferred in Vertalo');
    }

    return {
      amount: this.amount.getAmount(),
      shares: this.shares!,
      unitSharePrice: this.unitSharePrice!.getAmount(),
    };
  }

  isVertaloDistributionOpened(): boolean {
    if (!this.tradeSchema.vertaloDistributionState) {
      throw new Error('Vertalo distribution state is not set');
    }

    return this.tradeSchema.vertaloDistributionState.status === 'open';
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

  getDividendId() {
    return this.tradeSchema.dividendId;
  }

  forDividendReinvestedEvent() {
    return {
      profileId: this.tradeSchema.tradeConfiguration.profileId,
      accountId: this.tradeSchema.tradeConfiguration.accountId,
      amount: this.tradeSchema.tradeConfiguration.amount,
      dividendId: this.tradeSchema.dividendId,
    };
  }

  private calculateShares(amount: Money, unitSharePrice: Money): number {
    const shares = amount.divideByMoney(unitSharePrice);

    return shares;
  }
}
