import { JSONObject } from 'HKEKTypes/Generics';
import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import type {
  AgreementTypes,
  InvestmentsFeesStatus,
  InvestmentStatus,
  RecurringInvestmentFrequency,
  RecurringInvestmentStatus,
  ScheduledBy,
  SubscriptionAgreementStatus,
} from 'Reinvest/Investments/src/Domain/Investments/Types';

export interface InvestmentsTable {
  accountId: string;
  amount: number;
  bankAccountId: string;
  dateCreated: Date;
  dateStarted: Date | null;
  dateUpdated: Date;
  id: string;
  portfolioId: string;
  profileId: string;
  recurringInvestmentId: string | null;
  scheduledBy: ScheduledBy;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;
  tradeId: string;
}

export interface SubscriptionAgreementTable {
  accountId: string;
  agreementType: AgreementTypes;
  contentFieldsJson: JSONObject;
  dateCreated: Date;
  id: string;
  investmentId: string | null;
  pdfDateCreated: Date | null;
  profileId: string;
  signedAt: Date | null;
  signedByIP: string | null;
  status: SubscriptionAgreementStatus;
  templateVersion: number;
}

export interface InvestmentsFeesTable {
  accountId: string;
  amount: number;
  approveDate: Date | null;
  approvedByIP: string | null;
  dateCreated: Date;
  id: string;
  investmentId: string;
  profileId: string;
  status: InvestmentsFeesStatus;
  verificationFeeId: string;
}

export interface TransactionEventsTable {
  dateCreated: Date;
  eventKind: TransactionEvents;
  eventStateJson: JSONObject;
  id: string;
  investmentId: string;
}

export interface RecurringInvestmentsTable {
  accountId: string;
  amount: number;
  dateCreated: Date;
  frequency: RecurringInvestmentFrequency;
  id: string;
  portfolioId: string;
  profileId: string;
  startDate: Date;
  status: RecurringInvestmentStatus;
  subscriptionAgreementId: string | null;
}
