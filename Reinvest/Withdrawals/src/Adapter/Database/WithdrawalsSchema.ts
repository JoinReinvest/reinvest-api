import type { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DividendWithdrawalDecision } from 'Withdrawals/Domain/DividendWithdrawalRequest';
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
  payoutId: UUID | null;
  profileId: UUID;
  redemptionId: UUID | null;
  sharesJson: string;
  status: WithdrawalsFundsRequestsStatuses;
  totalDividends: number;
  totalFee: number;
  totalFunds: number;
}

export interface WithdrawalsFundsRequestsAgreementsTable {
  accountId: UUID;
  contentFieldsJson: JSONObject;
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
  payoutId: UUID | null;
  profileId: UUID;
  status: DividendWithdrawalDecision;
}
