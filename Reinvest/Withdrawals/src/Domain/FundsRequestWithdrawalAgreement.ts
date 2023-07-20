import { JSONObject } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { WithdrawalsFundsRequestsAgreementsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';
import { WithdrawalsFundsRequestsAgreementsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequestsAgreement';

type FundsRequestWithdrawalAgreementSchema = WithdrawalsFundsRequestsAgreementsTable;

export class FundsRequestWithdrawalAgreement {
  private accountId: string;
  private contentFieldsJson: JSONObject;
  private dateCreated: Date;
  private id: string;
  private fundsRequestId: string | null;
  private pdfDateCreated: Date | null;
  private profileId: string;
  private signedAt: Date | null;
  private signedByIP: string | null;
  private status: WithdrawalsFundsRequestsAgreementsStatuses;
  private templateVersion: number;

  constructor(
    id: string,
    profileId: string,
    fundsRequestId: string | null,
    status: WithdrawalsFundsRequestsAgreementsStatuses,
    accountId: string,
    dateCreated: Date,
    signedAt: Date | null,
    signedByIP: string | null,
    pdfDateCreated: Date | null,
    templateVersion: number,
    contentFieldsJson: JSONObject,
  ) {
    this.accountId = accountId;
    this.contentFieldsJson = contentFieldsJson;
    this.dateCreated = dateCreated;
    this.id = id;
    this.fundsRequestId = fundsRequestId;
    this.pdfDateCreated = pdfDateCreated;
    this.profileId = profileId;
    this.signedAt = signedAt;
    this.signedByIP = signedByIP;
    this.status = status;
    this.templateVersion = templateVersion;
  }

  static create(data: FundsRequestWithdrawalAgreementSchema) {
    const { id, profileId, fundsRequestId, status, accountId, dateCreated, signedAt, signedByIP, pdfDateCreated, templateVersion, contentFieldsJson } = data;

    return new FundsRequestWithdrawalAgreement(
      id,
      profileId,
      fundsRequestId,
      status,
      accountId,
      dateCreated,
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

  signAgreement(ip: string) {
    if (this.isSigned()) {
      return;
    }

    this.status = WithdrawalsFundsRequestsAgreementsStatuses.SIGNED;
    this.signedByIP = ip;
    this.signedAt = DateTime.now().toDate();
  }

  isSigned() {
    return this.status === WithdrawalsFundsRequestsAgreementsStatuses.SIGNED;
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
      fundsRequestId: this.fundsRequestId,
      status: this.status,
      accountId: this.accountId,
      dateCreated: this.dateCreated,
      signedAt: this.signedAt,
      signedByIP: this.signedByIP,
      pdfDateCreated: this.pdfDateCreated,
      templateVersion: this.templateVersion,
      contentFieldsJson: this.contentFieldsJson,
    };
  }
}
