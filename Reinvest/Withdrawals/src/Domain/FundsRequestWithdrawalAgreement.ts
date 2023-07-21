import { DateTime } from 'Money/DateTime';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { Templates } from 'Templates/Types';
import { WithdrawalsFundsRequestsAgreementsTable } from 'Withdrawals/Adapter/Database/WithdrawalsSchema';
import { WithdrawalsFundsRequestsAgreementsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequestsAgreement';

type FundsRequestWithdrawalAgreementSchema = WithdrawalsFundsRequestsAgreementsTable;

export class FundsRequestWithdrawalAgreement {
  private accountId: string;
  private contentFieldsJson: LatestTemplateContentFields[Templates.WITHDRAWAL_AGREEMENT];
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
    contentFieldsJson: LatestTemplateContentFields[Templates.WITHDRAWAL_AGREEMENT],
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
      <LatestTemplateContentFields[Templates.WITHDRAWAL_AGREEMENT]>contentFieldsJson,
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
    const signedAt = DateTime.now();
    this.signedAt = signedAt.toDate();

    this.contentFieldsJson.ipAddress = ip;
    this.contentFieldsJson.signingTimestamp = signedAt.toTimestamp().toString();
    this.contentFieldsJson.signingDate = signedAt.toFormattedDate('MM/DD/YYYY');
  }

  isSigned() {
    return this.status === WithdrawalsFundsRequestsAgreementsStatuses.SIGNED;
  }

  forParser() {
    return {
      version: this.templateVersion,
      content: this.contentFieldsJson,
      template: Templates.WITHDRAWAL_AGREEMENT,
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

  markAsGenerated() {
    this.pdfDateCreated = DateTime.now().toDate();
  }
}
