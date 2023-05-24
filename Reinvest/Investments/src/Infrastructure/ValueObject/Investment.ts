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
  tradeId: string;
  dateStarted: Date | null;

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
  }

  static create(data: InvestmentsTable) {
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

  setInvestmentStarted() {
    this.status = InvestmentStatus.FUNDED;
    this.dateStarted = new Date();
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
    };
  }
}
