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
  bankAccountId: string | null;

  constructor(
    id: string,
    status: InvestmentStatus,
    dateCreated: Date,
    amount: number,
    subscriptionAgreementId: string | null,
    feeAmount: number | null,
    tradeId: string,
    bankAccountId: string | null,
  ) {
    this.id = id;
    this.status = status;
    this.dateCreated = dateCreated;
    this.amount = amount;
    this.subscriptionAgreementId = subscriptionAgreementId;
    this.feeAmount = feeAmount;
    this.tradeId = tradeId;
    this.bankAccountId = bankAccountId;
  }

  static create(data: InvestmentSummarySchema) {
    const { id, status, dateCreated, amount, subscriptionAgreementId, feeAmount, tradeId, bankAccountId } = data;

    return new InvestmentSummary(id, status, dateCreated, amount, subscriptionAgreementId, feeAmount, tradeId, bankAccountId);
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
