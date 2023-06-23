import { UUID } from 'HKEKTypes/Generics';

import { WithdrawalsFundsRequestsStatuses } from './WithdrawalsFundsRequests';
import { Money } from 'Money/Money';

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

export type WithdrawalView = {};

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

export enum WithdrawalStatus {
  AWAITING_SIGNING_AGREEMENT = 'AWAITING_SIGNING_AGREEMENT',
  DRAFT = 'DRAFT',
  AWAITING_DECISION = 'AWAITING_DECISION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum WithdrawalError {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PENDING_WITHDRAWAL_EXISTS = 'PENDING_WITHDRAWAL_EXISTS',
  CAN_NOT_WITHDRAW = 'CAN_NOT_WITHDRAW',
  NO_PENDING_WITHDRAWAL_REQUEST = 'NO_PENDING_WITHDRAWAL_REQUEST',
  NO_WITHDRAWAL_AGREEMENT = 'NO_WITHDRAWAL_AGREEMENT',
  WITHDRAWAL_AGREEMENT_ALREADY_SIGNED = 'WITHDRAWAL_AGREEMENT_ALREADY_SIGNED',
  WITHDRAWAL_AGREEMENT_NOT_SIGNED = 'WITHDRAWAL_AGREEMENT_NOT_SIGNED',
  WITHDRAWAL_REQUEST_ALREADY_SENT = 'WITHDRAWAL_REQUEST_ALREADY_SENT',
  CANNOT_BE_ABORTED = 'CANNOT_BE_ABORTED',
}

export class FundsWithdrawalRequest {
  private accountId: UUID;
  private accountValue: Money;
  private adminDecisionReason: string | null;
  private agreementId: UUID | null;
  private dateCreated: Date;
  private dateDecision: Date | null;
  private dividendsJson: DividendData[];
  private eligibleFunds: Money;
  private id: UUID;
  private investorWithdrawalReason: string | null;
  private numberOfShares: number;
  private payoutId: UUID | null;
  private profileId: UUID;
  private redemptionId: UUID | null;
  private sharesJson: SettledSharesData[];
  private status: WithdrawalsFundsRequestsStatuses;
  private totalDividends: number;
  private totalFee: Money;
  private totalFunds: Money;

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
    this.accountValue = Money.lowPrecision(accountValue);
    this.adminDecisionReason = adminDecisionReason;
    this.agreementId = agreementId;
    this.dateCreated = dateCreated;
    this.dateDecision = dateDecision;
    this.dividendsJson = dividendsJson;
    this.eligibleFunds = Money.lowPrecision(eligibleFunds);
    this.id = id;
    this.investorWithdrawalReason = investorWithdrawalReason;
    this.numberOfShares = numberOfShares;
    this.payoutId = payoutId;
    this.profileId = profileId;
    this.redemptionId = redemptionId;
    this.sharesJson = sharesJson;
    this.status = status;
    this.totalDividends = totalDividends;
    this.totalFee = Money.lowPrecision(totalFee);
    this.totalFunds = Money.lowPrecision(totalFunds);
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

  assignAgreement(id: string) {
    this.agreementId = id;
  }

  getId() {
    return this.id;
  }

  abort() {
    if (this.status === WithdrawalsFundsRequestsStatuses.REJECTED || this.status === WithdrawalsFundsRequestsStatuses.ACCEPTED) {
      throw new Error(WithdrawalError.CANNOT_BE_ABORTED);
    } else {
      this.status = WithdrawalsFundsRequestsStatuses.ABORTED;
    }
  }

  request() {
    this.status = WithdrawalsFundsRequestsStatuses.REQUESTED;
  }

  getWithdrawalStatus(): WithdrawalStatus {
    switch (this.status) {
      case WithdrawalsFundsRequestsStatuses.REQUESTED:
        return WithdrawalStatus.AWAITING_DECISION;
      case WithdrawalsFundsRequestsStatuses.ACCEPTED:
        return WithdrawalStatus.APPROVED;
      case WithdrawalsFundsRequestsStatuses.REJECTED:
        return WithdrawalStatus.REJECTED;
      case WithdrawalsFundsRequestsStatuses.DRAFT:
        if (!this.agreementId) {
          return WithdrawalStatus.AWAITING_SIGNING_AGREEMENT;
        } else {
          return WithdrawalStatus.DRAFT;
        }
      default:
        return WithdrawalStatus.DRAFT;
    }
  }

  toObject() {
    return {
      accountId: this.accountId,
      accountValue: this.accountValue.getAmount(),
      adminDecisionReason: this.adminDecisionReason,
      agreementId: this.agreementId,
      dateCreated: this.dateCreated,
      dateDecision: this.dateDecision,
      dividendsJson: this.dividendsJson,
      eligibleFunds: this.eligibleFunds.getAmount(),
      id: this.id,
      investorWithdrawalReason: this.investorWithdrawalReason,
      numberOfShares: this.numberOfShares,
      payoutId: this.payoutId,
      profileId: this.profileId,
      redemptionId: this.redemptionId,
      sharesJson: this.sharesJson,
      status: this.status,
      totalDividends: this.totalDividends,
      totalFee: this.totalFee.getAmount(),
      totalFunds: this.totalFunds.getAmount(),
    };
  }

  isRequested(): boolean {
    return this.status === WithdrawalsFundsRequestsStatuses.REQUESTED;
  }

  getWithdrawalView(): WithdrawalView {
    return {
      status: this.getWithdrawalStatus(),
      createdDate: this.dateCreated,
      decisionDate: this.dateDecision,
      decisionMessage: this.adminDecisionReason,
      eligibleForWithdrawal: {
        value: this.eligibleFunds.getAmount(),
        formatted: this.eligibleFunds.getFormattedAmount(),
      },
      accountValue: {
        value: this.accountValue.getAmount(),
        formatted: this.accountValue.getFormattedAmount(),
      },
      penaltiesFee: {
        value: this.totalFee.getAmount(),
        formatted: this.totalFee.getFormattedAmount(),
      },
    };
  }

  isDraft(): boolean {
    return this.status === WithdrawalsFundsRequestsStatuses.DRAFT;
  }

  isAgreementAssigned(): boolean {
    return !!this.agreementId;
  }
}
