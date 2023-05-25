import { GracePeriod } from 'Investments/Domain/Investments/GracePeriod';
import { InvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

import { InvestmentStatus, ScheduledBy } from './Types';

type InvestmentSchema = InvestmentsTable;

export class Investment {
  private accountId: string;
  private amount: number;
  private bankAccountId: string;
  private dateCreated: Date;
  private dateUpdated: Date;
  private id: string;
  private profileId: string;
  private recurringInvestmentId: string | null;
  private scheduledBy: ScheduledBy;
  private status: InvestmentStatus;
  private subscriptionAgreementId: string | null;
  private tradeId: string;
  private dateStarted: Date | null;
  private gracePeriod: GracePeriod;

  constructor(
    accountId: string,
    amount: number,
    bankAccountId: string,
    dateCreated: Date,
    dateUpdated: Date,
    id: string,
    profileId: string,
    recurringInvestmentId: string | null,
    scheduledBy: ScheduledBy,
    status: InvestmentStatus,
    subscriptionAgreementId: string | null,
    tradeId: string,
    dateStarted: Date | null,
  ) {
    this.accountId = accountId;
    this.amount = amount;
    this.bankAccountId = bankAccountId;
    this.dateCreated = dateCreated;
    this.dateUpdated = dateUpdated;
    this.id = id;
    this.profileId = profileId;
    this.recurringInvestmentId = recurringInvestmentId;
    this.scheduledBy = scheduledBy;
    this.status = status;
    this.subscriptionAgreementId = subscriptionAgreementId;
    this.tradeId = tradeId;
    this.dateStarted = dateStarted;
    this.gracePeriod = new GracePeriod(dateStarted);
  }

  static create(data: InvestmentSchema) {
    const {
      accountId,
      amount,
      bankAccountId,
      dateCreated,
      dateUpdated,
      id,
      profileId,
      recurringInvestmentId,
      scheduledBy,
      status,
      subscriptionAgreementId,
      tradeId,
      dateStarted,
    } = data;

    return new Investment(
      accountId,
      amount,
      bankAccountId,
      dateCreated,
      dateUpdated,
      id,
      profileId,
      recurringInvestmentId,
      scheduledBy,
      status,
      subscriptionAgreementId,
      tradeId,
      dateStarted,
    );
  }

  assignSubscriptionAgreement(id: string) {
    this.subscriptionAgreementId = id;
  }

  updateStatus(status: InvestmentStatus) {
    this.status = status;
  }

  getSubscriptionAgreementId() {
    return this.subscriptionAgreementId;
  }

  startInvestment() {
    this.dateStarted = new Date();
    this.gracePeriod = new GracePeriod(this.dateStarted);
    this.status = InvestmentStatus.IN_PROGRESS;
  }

  isStartedInvestment() {
    return this.status === InvestmentStatus.IN_PROGRESS && this.dateStarted !== null;
  }

  toObject() {
    return {
      accountId: this.accountId,
      amount: this.amount,
      bankAccountId: this.bankAccountId,
      dateCreated: this.dateCreated,
      dateUpdated: this.dateUpdated,
      id: this.id,
      profileId: this.profileId,
      recurringInvestmentId: this.recurringInvestmentId,
      scheduledBy: this.scheduledBy,
      status: this.status,
      subscriptionAgreementId: this.subscriptionAgreementId,
      dateStarted: this.dateStarted,
      tradeId: this.tradeId,
    };
  }

  isGracePeriodEnded() {
    return this.gracePeriod.isGracePeriodEnded();
  }
}
