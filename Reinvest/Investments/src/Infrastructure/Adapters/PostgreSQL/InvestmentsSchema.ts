import { JSONObject } from 'HKEKTypes/Generics';
import { AgreementTypes, InvestmentStatus, ScheduledBy, SubscriptionAgreementStatus } from 'Reinvest/Investments/src/Domain/Investments/Types';
import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';

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

export interface TransactionEventsTable {
  dateCreated: Date;
  eventKind: TransactionEvents;
  eventStateJson: JSONObject;
  id: string;
  investmentId: string;
}
