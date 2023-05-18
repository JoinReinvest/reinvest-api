import { JSONObject } from 'HKEKTypes/Generics';

import { AgreementTypes, ScheduledBy, Statuses, SubscriptionAgreementStatus } from './InvestmentsTypes';

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
