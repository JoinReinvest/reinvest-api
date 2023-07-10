import { RecurringInvestmentSchedule } from 'Investments/Domain/ValueObject/RecuringInvestmentSchedule';
import { RecurringInvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';
import { Money } from 'Money/Money';

import { RecurringInvestmentStatus } from './Types';

type RecurringInvestmentSchema = RecurringInvestmentsTable;

export class RecurringInvestment {
  private schedule: RecurringInvestmentSchedule;
  private accountId: string;
  private amount: number;
  private dateCreated: Date;
  private id: string;
  private portfolioId: string;
  private profileId: string;
  private status: RecurringInvestmentStatus;
  private subscriptionAgreementId: string | null;

  constructor(
    schedule: RecurringInvestmentSchedule,
    accountId: string,
    amount: number,
    dateCreated: Date,
    id: string,
    portfolioId: string,
    profileId: string,
    status: RecurringInvestmentStatus,
    subscriptionAgreementId: string | null,
  ) {
    this.schedule = schedule;
    this.accountId = accountId;
    this.amount = amount;
    this.dateCreated = dateCreated;
    this.id = id;
    this.portfolioId = portfolioId;
    this.profileId = profileId;
    this.status = status;
    this.subscriptionAgreementId = subscriptionAgreementId;
  }

  static create(data: RecurringInvestmentSchema) {
    const { accountId, amount, dateCreated, frequency, id, portfolioId, profileId, startDate, status, subscriptionAgreementId } = data;

    const schedule = RecurringInvestmentSchedule.create({ startDate, frequency });

    return new RecurringInvestment(schedule, accountId, amount, dateCreated, id, portfolioId, profileId, status, subscriptionAgreementId);
  }

  getAmount() {
    const amount = new Money(this.amount);

    return {
      formatted: amount.getFormattedAmount(),
      value: amount.getAmount(),
    };
  }

  assignSubscriptionAgreement(id: string) {
    this.subscriptionAgreementId = id;
  }

  deactivate() {
    this.status = RecurringInvestmentStatus.INACTIVE;
  }

  activate() {
    this.status = RecurringInvestmentStatus.ACTIVE;
  }

  getStatus() {
    return this.status;
  }

  getId() {
    return this.id;
  }

  getSchedule() {
    const { frequency, startDate } = this.schedule.toObject();

    return {
      frequency,
      startDate,
    };
  }

  isReadyToActivate() {
    return !!this.subscriptionAgreementId;
  }

  toObject() {
    return {
      accountId: this.accountId,
      amount: this.amount,
      dateCreated: this.dateCreated,
      schedule: this.schedule,
      id: this.id,
      portfolioId: this.portfolioId,
      profileId: this.profileId,
      status: this.status,
      subscriptionAgreementId: this.subscriptionAgreementId,
    };
  }
}
