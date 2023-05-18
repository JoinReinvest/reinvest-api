import { ScheduledBy, Statuses } from './InvestmentsTypes';

export interface InvestmentsTable {
  accountId: string;
  amount: number;
  dateCreated: Date;
  dateUpdated: Date;
  id: string;
  profileId: string;
  recurringInvestmentId: string | null;
  scheduledBy: ScheduledBy;
  status: Statuses;
  subscriptionAgreementId: string | null;
}
