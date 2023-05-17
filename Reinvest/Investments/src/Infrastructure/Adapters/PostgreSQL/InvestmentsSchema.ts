export interface InvestmentsTable {
  accountId: string;
  amount: number;
  dateCreated: Date;
  dateUpdated: Date;
  id: string;
  profileId: string;
  recurringInvestmentId: string | null;
  // todo move these enums to other file
  scheduledBy: 'DIRECT' | 'SCHEDULER';
  status:
    | 'WAITING_FOR_SUBSCRIPTION_AGREEMENT'
    | 'WAITING_FOR_FEES_APPROVAL'
    | 'WAITING_FOR_INVESTMENT_START'
    | 'IN_PROGRESS'
    | 'FUNDED'
    | 'FAILED'
    | 'FINISHED';
  subscriptionAgreementId: string | null;
}
