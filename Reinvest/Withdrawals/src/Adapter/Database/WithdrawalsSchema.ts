import { JSONObject, UUID } from 'HKEKTypes/Generics';
import { DividendWithdrawalDecision } from 'Withdrawals/Domain/DividendWithdrawalRequest';

export interface WithdrawalsFundsRequestsTable {
  disbursementJson: JSONObject;
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
