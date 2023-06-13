import { JSONObject } from 'HKEKTypes/Generics';
import { AgreementTypes, SubscriptionAgreementStatus } from 'Investments/Domain/Investments/Types';
import { SubscriptionAgreementTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

type SubscriptionAgreementSchema = SubscriptionAgreementTable;

export class SubscriptionAgreement {
  private accountId: string;
  private agreementType: AgreementTypes;
  private contentFieldsJson: JSONObject;
  private dateCreated: Date;
  private id: string;
  private investmentId: string | null;
  private pdfDateCreated: Date | null;
  private profileId: string;
  private signedAt: Date | null;
  private signedByIP: string | null;
  private status: SubscriptionAgreementStatus;
  private templateVersion: number;

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

  static create(data: SubscriptionAgreementSchema) {
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

  getId() {
    return this.id;
  }

  setSignature(ip: string) {
    this.status = SubscriptionAgreementStatus.SIGNED;
    this.signedByIP = ip;
    this.signedAt = new Date();
  }

  isSigned() {
    return this.status === SubscriptionAgreementStatus.SIGNED;
  }

  getDataForParser() {
    return {
      templateVersion: this.templateVersion,
      contentFieldsJson: this.contentFieldsJson,
    };
  }

  toObject() {
    return {
      id: this.id,
      profileId: this.profileId,
      investmentId: this.investmentId,
      status: this.status,
      accountId: this.accountId,
      dateCreated: this.dateCreated,
      agreementType: this.agreementType,
      signedAt: this.signedAt,
      signedByIP: this.signedByIP,
      pdfDateCreated: this.pdfDateCreated,
      templateVersion: this.templateVersion,
      contentFieldsJson: this.contentFieldsJson,
    };
  }
}
