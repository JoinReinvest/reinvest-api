import { UUID } from 'HKEKTypes/Generics';

import { WithdrawalsFundsRequestsStatuses } from './WithdrawalsFundsRequests';

export type SettledSharesData = {
  currentNavPerShare: number;
  id: UUID;
  numberOfShares: number;
  transactionDate: string;
  unitPrice: number;
};

export type DividendData = {
  id: UUID;
  totalDividendAmount: number;
  totalFeeAmount: number;
};

export type FundsWithdrawalRequestSchema = {
  accountId: UUID;
  accountValue: number;
  adminDecisionReason: string | null;
  agreementId: UUID | null;
  dateCreated: Date;
  dateDecision: Date | null;
  dividendsJson: DividendData[];
  eligibleFunds: number;
  id: UUID;
  investorWithdrawalReason: string | null;
  numberOfShares: number;
  payoutId: UUID | null;
  profileId: UUID;
  redemptionId: UUID | null;
  sharesJson: SettledSharesData[];
  status: WithdrawalsFundsRequestsStatuses;
  totalDividends: number;
  totalFee: number;
  totalFunds: number;
};
export class FundsWithdrawalRequest {
  private accountId: UUID;
  private accountValue: number;
  private adminDecisionReason: string | null;
  private agreementId: UUID | null;
  private dateCreated: Date;
  private dateDecision: Date | null;
  private dividendsJson: DividendData[];
  private eligibleFunds: number;
  private id: UUID;
  private investorWithdrawalReason: string | null;
  private numberOfShares: number;
  private payoutId: UUID | null;
  private profileId: UUID;
  private redemptionId: UUID | null;
  private sharesJson: SettledSharesData[];
  private status: WithdrawalsFundsRequestsStatuses;
  private totalDividends: number;
  private totalFee: number;
  private totalFunds: number;

  constructor(
    accountId: UUID,
    accountValue: number,
    adminDecisionReason: string | null,
    agreementId: UUID | null,
    dateCreated: Date,
    dateDecision: Date | null,
    dividendsJson: DividendData[],
    eligibleFunds: number,
    id: UUID,
    investorWithdrawalReason: string | null,
    numberOfShares: number,
    payoutId: UUID | null,
    profileId: UUID,
    redemptionId: UUID | null,
    sharesJson: SettledSharesData[],
    status: WithdrawalsFundsRequestsStatuses,
    totalDividends: number,
    totalFee: number,
    totalFunds: number,
  ) {
    this.accountId = accountId;
    this.accountValue = accountValue;
    this.adminDecisionReason = adminDecisionReason;
    this.agreementId = agreementId;
    this.dateCreated = dateCreated;
    this.dateDecision = dateDecision;
    this.dividendsJson = dividendsJson;
    this.eligibleFunds = eligibleFunds;
    this.id = id;
    this.investorWithdrawalReason = investorWithdrawalReason;
    this.numberOfShares = numberOfShares;
    this.payoutId = payoutId;
    this.profileId = profileId;
    this.redemptionId = redemptionId;
    this.sharesJson = sharesJson;
    this.status = status;
    this.totalDividends = totalDividends;
    this.totalFee = totalFee;
    this.totalFunds = totalFunds;
  }

  static create(fundsWithdrawalRequestData: FundsWithdrawalRequestSchema) {
    const {
      accountId,
      accountValue,
      adminDecisionReason,
      agreementId,
      dateCreated,
      dateDecision,
      dividendsJson,
      eligibleFunds,
      id,
      investorWithdrawalReason,
      numberOfShares,
      payoutId,
      profileId,
      redemptionId,
      sharesJson,
      status,
      totalDividends,
      totalFee,
      totalFunds,
    } = fundsWithdrawalRequestData;

    return new FundsWithdrawalRequest(
      accountId,
      accountValue,
      adminDecisionReason,
      agreementId,
      dateCreated,
      dateDecision,
      dividendsJson,
      eligibleFunds,
      id,
      investorWithdrawalReason,
      numberOfShares,
      payoutId,
      profileId,
      redemptionId,
      sharesJson,
      status,
      totalDividends,
      totalFee,
      totalFunds,
    );
  }

  toObject() {
    return {
      accountId: this.accountId,
      accountValue: this.accountValue,
      adminDecisionReason: this.adminDecisionReason,
      agreementId: this.agreementId,
      dateCreated: this.dateCreated,
      dateDecision: this.dateDecision,
      dividendsJson: this.dividendsJson,
      eligibleFunds: this.eligibleFunds,
      id: this.id,
      investorWithdrawalReason: this.investorWithdrawalReason,
      numberOfShares: this.numberOfShares,
      payoutId: this.payoutId,
      profileId: this.profileId,
      redemptionId: this.redemptionId,
      sharesJson: this.sharesJson,
      status: this.status,
      totalDividends: this.totalDividends,
      totalFee: this.totalFee,
      totalFunds: this.totalFunds,
    };
  }
}
