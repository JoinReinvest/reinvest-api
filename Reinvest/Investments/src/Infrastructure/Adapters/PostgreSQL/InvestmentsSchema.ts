import { JSONObject, JSONObjectOf } from 'HKEKTypes/Generics';
import { VerificationFeeIds } from 'Investments/Domain/Investments/Fee';
import { RecurringInvestmentExecutionInvestmentStatus } from 'Investments/Domain/Investments/RecurringInvestmentExecution';
import { ReinvestmentEvents } from 'Investments/Domain/Reinvestments/ReinvestmentEvents';
import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import type {
  AgreementTypes,
  InvestmentsFeesStatus,
  InvestmentStatus,
  Origin,
  RecurringInvestmentFrequency,
  RecurringInvestmentStatus,
  SubscriptionAgreementStatus,
} from 'Reinvest/Investments/src/Domain/Investments/Types';
import { TemplateContentType } from 'Templates/Types';

export interface InvestmentsTable {
  accountId: string;
  amount: number;
  bankAccountId: string;
  dateCreated: Date;
  dateStarted: Date | null;
  dateUpdated: Date;
  id: string;
  origin: Origin;
  originId: string | null;
  parentId: string | null;
  portfolioId: string;
  profileId: string;
  reason: string | null;
  status: InvestmentStatus;
  subscriptionAgreementId: string | null;
  tradeId: string;
  unitPrice: number;
}

export interface SubscriptionAgreementTable {
  accountId: string;
  agreementType: AgreementTypes;
  contentFieldsJson: JSONObjectOf<TemplateContentType>;
  dateCreated: Date;
  id: string;
  investmentId: string;
  pdfDateCreated: Date | null;
  profileId: string;
  signedAt: Date | null;
  signedByIP: string | null;
  status: SubscriptionAgreementStatus;
  templateVersion: number;
}

export interface InvestmentsFeesTable {
  abortedDate: Date | null;
  accountId: string;
  amount: number;
  approveDate: Date | null;
  approvedByIP: string | null;
  dateCreated: Date;
  id: string;
  investmentId: string;
  profileId: string;
  status: InvestmentsFeesStatus;
  verificationFeeIdsJson: JSONObjectOf<VerificationFeeIds>;
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
  nextDate: Date;
  portfolioId: string;
  profileId: string;
  startDate: Date;
  status: RecurringInvestmentStatus;
  subscriptionAgreementId: string | null;
}

export interface RecurringInvestmentsExecutionTable {
  dateCreated: Date;
  executionDate: Date;
  id: string;
  investmentId: string;
  investmentStatus: RecurringInvestmentExecutionInvestmentStatus;
  recurringInvestmentId: string;
}

export interface ReinvestmentEventsTable {
  dateCreated: Date;
  dividendId: string;
  eventKind: ReinvestmentEvents;
  eventStateJson: JSONObject;
  id: string;
}
