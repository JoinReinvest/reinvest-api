import { RecurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { Money } from 'Money/Money';

import { RecurringInvestmentFrequency, RecurringInvestmentStatus } from './Types';

type RecurringInvestmentSchema = RecurringInvestmentsTable;

export class RecurringInvestment {
  private accountId: string;
  private amount: number;
  private dateCreated: Date;
  private frequency: RecurringInvestmentFrequency;
  private id: string;
  private portfolioId: string;
  private profileId: string;
  private startDate: string | null;
  private status: RecurringInvestmentStatus;
  private subscriptionAgreementId: string | null;

  constructor(
    accountId: string,
    amount: number,
    dateCreated: Date,
    frequency: RecurringInvestmentFrequency,
    id: string,
    portfolioId: string,
    profileId: string,
    startDate: string | null,
    status: RecurringInvestmentStatus,
    subscriptionAgreementId: string | null,
  ) {
    this.accountId = accountId;
    this.amount = amount;
    this.dateCreated = dateCreated;
    this.frequency = frequency;
    this.id = id;
    this.portfolioId = portfolioId;
    this.profileId = profileId;
    this.startDate = startDate;
    this.status = status;
    this.subscriptionAgreementId = subscriptionAgreementId;
  }

  static create(data: RecurringInvestmentSchema) {
    const { accountId, amount, dateCreated, frequency, id, portfolioId, profileId, startDate, status, subscriptionAgreementId } = data;

    return new RecurringInvestment(accountId, amount, dateCreated, frequency, id, portfolioId, profileId, startDate, status, subscriptionAgreementId);
  }

  getAmount() {
    const amount = new Money(this.amount);

    return {
      formatted: amount.getFormattedAmount(),
      value: amount.getAmount(),
    };
  }

  toObject() {
    return {
      accountId: this.accountId,
      amount: this.amount,
      dateCreated: this.dateCreated,
      frequency: this.frequency,
      id: this.id,
      portfolioId: this.portfolioId,
      profileId: this.profileId,
      startDate: this.startDate,
      status: this.status,
      subscriptionAgreementId: this.subscriptionAgreementId,
    };
  }
}
