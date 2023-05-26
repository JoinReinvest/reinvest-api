export enum InvestmentStatus {
  WAITING_FOR_SUBSCRIPTION_AGREEMENT = 'WAITING_FOR_SUBSCRIPTION_AGREEMENT',
  WAITING_FOR_FEES_APPROVAL = 'WAITING_FOR_FEES_APPROVAL',
  WAITING_FOR_INVESTMENT_START = 'WAITING_FOR_INVESTMENT_START',
  IN_PROGRESS = 'IN_PROGRESS',
  FUNDED = 'FUNDED',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
}

export enum ScheduledBy {
  DIRECT = 'DIRECT',
  SCHEDULER = 'SCHEDULER',
}

export enum AgreementTypes {
  DIRECT_DEPOSIT = 'DIRECT_DEPOSIT',
  RECURRING_INVESTMENT = 'RECURRING_INVESTMENT',
}

export enum SubscriptionAgreementStatus {
  WAITING_FOR_SIGNATURE = 'WAITING_FOR_SIGNATURE',
  SIGNED = 'SIGNED',
}

export enum InvestmentsFeesStatus {
  AWAITING = 'AWAITING',
  APPROVED = 'APPROVED',
  ABORTED = 'ABORTED',
}

export type InvestmentSummarySchema = {
  amount: number;
  dateCreated: Date;
  feeAmount: number | null;
  id: string;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;
  tradeId: string;
};

export enum RecurringInvestmentFrequency {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export enum RecurringInvestmentStatus {
  DRAFT = 'DRAFT',
  WAITING_FOR_SIGNING_SUBSCRIPTION_AGREEMENT = 'WAITING_FOR_SIGNING_SUBSCRIPTION_AGREEMENT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}
