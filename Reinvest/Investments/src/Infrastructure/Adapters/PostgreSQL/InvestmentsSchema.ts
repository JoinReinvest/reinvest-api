import { InvestmentStatus, ScheduledBy } from 'Reinvest/Investments/src/Domain/Investments/Types';

export interface InvestmentsTable {
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
}
