import type { JSONObjectOf, UUID } from 'HKEKTypes/Generics';
import { LatestTemplateContentFields } from 'Templates/TemplateConfiguration';
import { TemplateContentType, Templates, TemplateVersion } from 'Templates/Types';
import { DividendWithdrawalDecision } from 'Withdrawals/Domain/DividendWithdrawalRequest';
import { UUIDsList, WithdrawalsStatus } from 'Withdrawals/Domain/Withdrawal';
import type { WithdrawalsDocumentsStatus, WithdrawalsDocumentsTypes } from 'Withdrawals/Domain/WithdrawalsDocuments';
import type { WithdrawalsFundsRequestsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequests';
import type { WithdrawalsFundsRequestsAgreementsStatuses } from 'Withdrawals/Domain/WithdrawalsFundsRequestsAgreement';

export interface WithdrawalsFundsRequestsTable {
  accountId: UUID;
  accountValue: number;
  adminDecisionReason: string | null;
  agreementId: UUID | null;
  dateCreated: Date;
  dateDecision: Date | null;
  dividendsJson: string;
  eligibleFunds: number;
  id: UUID;
  investorWithdrawalReason: string | null;
  numberOfShares: number;
  profileId: UUID;
  sharesJson: string;
  status: WithdrawalsFundsRequestsStatuses;
  totalDividends: number;
  totalFee: number;
  totalFunds: number;
  withdrawalId: UUID | null;
}

export interface WithdrawalsFundsRequestsAgreementsTable {
  accountId: UUID;
  contentFieldsJson: JSONObjectOf<LatestTemplateContentFields[Templates.WITHDRAWAL_AGREEMENT]>;
  dateCreated: Date;
  fundsRequestId: UUID | null;
  id: string;
  pdfDateCreated: Date | null;
  profileId: UUID;
  signedAt: Date | null;
  signedByIP: string | null;
  status: WithdrawalsFundsRequestsAgreementsStatuses;
  templateVersion: number;
}

export interface WithdrawalsDividendsRequestsTable {
  accountId: UUID;
  dateCreated: Date;
  dateDecided: Date | null;
  dividendId: UUID;
  eligibleAmount: number;
  id: UUID;
  profileId: UUID;
  status: DividendWithdrawalDecision;
  withdrawalId: UUID | null;
}

export interface WithdrawalsTable {
  dateCompleted: Date | null;
  dateCreated: Date;
  id: UUID;
  listOfDividendsJson: JSONObjectOf<UUIDsList>;
  listOfWithdrawalsJson: JSONObjectOf<UUIDsList>;
  payoutId: UUID;
  redemptionId: UUID | null;
  status: WithdrawalsStatus;
}

export interface WithdrawalsDocumentsTable {
  contentFieldsJson: JSONObjectOf<TemplateContentType>;
  dateCreated: Date;
  id: UUID;
  pdfDateCreated: Date | null;
  status: WithdrawalsDocumentsStatus;
  templateName: Templates;
  templateVersion: TemplateVersion;
  type: WithdrawalsDocumentsTypes;
  withdrawalId: UUID;
}
