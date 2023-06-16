import type { JSONObject, UUID } from 'HKEKTypes/Generics';
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
  signedByIp: string | null;
  status: WithdrawalsFundsRequestsAgreementsStatuses;
  templateVersion: number;
}
