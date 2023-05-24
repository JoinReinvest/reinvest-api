import { GracePeriod } from 'Investments/Domain/Investments/GracePeriod';

import { InvestmentStatus, ScheduledBy } from '../../Domain/Investments/Types';
import { InvestmentsTable } from '../Adapters/PostgreSQL/InvestmentsSchema';

export class Investment {
  accountId: string;
  amount: number;
  bankAccountId: string;
  dateCreated: Date;
  dateUpdated: Date;
  id: string;
  profileId: string;
  recurringInvestmentId: string | null;
  scheduledBy: ScheduledBy;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;
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
    this.gracePeriod = new GracePeriod(dateCreated);
  }

  static create(data: InvestmentsTable) {
    const { accountId, amount, bankAccountId, dateCreated, dateUpdated, id, profileId, recurringInvestmentId, scheduledBy, status, subscriptionAgreementId } =
      data;

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
    );
  }

  isGracePeriodEnded() {
    return this.gracePeriod.isGracePeriodEnded();
  }
}
