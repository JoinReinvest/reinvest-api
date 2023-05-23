import { Money } from 'Money/Money';

import { InvestmentStatus, InvestmentSummarySchema } from '../../Domain/Investments/Types';

export class InvestmentSummary {
  amount: number;
  dateCreated: Date;
  feeAmount: number | null;
  id: string;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;

  constructor(id: string, status: InvestmentStatus, dateCreated: Date, amount: number, subscriptionAgreementId: string | null, feeAmount: number | null) {
    this.id = id;
    this.status = status;
    this.dateCreated = dateCreated;
    this.amount = amount;
    this.subscriptionAgreementId = subscriptionAgreementId;
    this.feeAmount = feeAmount;
  }

  static create(data: InvestmentSummarySchema) {
    const { id, status, dateCreated, amount, subscriptionAgreementId, feeAmount } = data;

    return new InvestmentSummary(id, status, dateCreated, amount, subscriptionAgreementId, feeAmount);
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
      return {
        formatted: null,
        value: null,
      };
    }

    const amount = new Money(this.feeAmount);

    return {
      formatted: amount.getFormattedAmount(),
      value: amount.getAmount(),
    };
  }
}
