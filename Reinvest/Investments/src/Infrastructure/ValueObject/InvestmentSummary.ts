import type { InvestmentStatus, InvestmentSummarySchema } from 'Investments/Domain/Investments/Types';
import { Money } from 'Money/Money';

export class InvestmentSummary {
  amount: number;
  dateCreated: Date;
  feeAmount: number | null;
  id: string;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;
  tradeId: string;

  constructor(
    id: string,
    status: InvestmentStatus,
    dateCreated: Date,
    amount: number,
    subscriptionAgreementId: string | null,
    feeAmount: number | null,
    tradeId: string,
  ) {
    this.id = id;
    this.status = status;
    this.dateCreated = dateCreated;
    this.amount = amount;
    this.subscriptionAgreementId = subscriptionAgreementId;
    this.feeAmount = feeAmount;
    this.tradeId = tradeId;
  }

  static create(data: InvestmentSummarySchema) {
    const { id, status, dateCreated, amount, subscriptionAgreementId, feeAmount, tradeId } = data;

    return new InvestmentSummary(id, status, dateCreated, amount, subscriptionAgreementId, feeAmount, tradeId);
  }

  getInvestmentAmount() {
    const amount = new Money(this.amount);

    return {
      formatted: amount.getFormattedAmount(),
      value: amount.getAmount(),
    };
  }

  getFeeAmount() {
    if (!this.feeAmount) {
      return null;
    }

    const amount = new Money(this.feeAmount);

    return {
      formatted: amount.getFormattedAmount(),
      value: amount.getAmount(),
    };
  }
}
