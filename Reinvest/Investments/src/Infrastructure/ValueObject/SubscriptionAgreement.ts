import { JSONObject } from 'HKEKTypes/Generics';

import { SubscriptionAgreementTable } from '../Adapters/PostgreSQL/InvestmentsSchema';
import { AgreementTypes, SubscriptionAgreementStatus } from '../Adapters/PostgreSQL/InvestmentsTypes';

export class SubscriptionAgreement {
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

  constructor(
    id: string,
    profileId: string,
    investmentId: string | null,
    status: SubscriptionAgreementStatus,
    accountId: string,
    dateCreated: Date,
    agreementType: AgreementTypes,
    signedAt: Date | null,
    signedByIP: string | null,
    pdfDateCreated: Date | null,
    templateVersion: number,
    contentFieldsJson: JSONObject,
  ) {
    this.accountId = accountId;
    this.agreementType = agreementType;
    this.contentFieldsJson = contentFieldsJson;
    this.dateCreated = dateCreated;
    this.id = id;
    this.investmentId = investmentId;
    this.pdfDateCreated = pdfDateCreated;
    this.profileId = profileId;
    this.signedAt = signedAt;
    this.signedByIP = signedByIP;
    this.status = status;
    this.templateVersion = templateVersion;
  }

  static create(data: SubscriptionAgreementTable) {
    const {
      id,
      profileId,
      investmentId,
      status,
      accountId,
      dateCreated,
      agreementType,
      signedAt,
      signedByIP,
      pdfDateCreated,
      templateVersion,
      contentFieldsJson,
    } = data;

    return new SubscriptionAgreement(
      id,
      profileId,
      investmentId,
      status,
      accountId,
      dateCreated,
      agreementType,
      signedAt,
      signedByIP,
      pdfDateCreated,
      templateVersion,
      contentFieldsJson,
    );
  }
}
