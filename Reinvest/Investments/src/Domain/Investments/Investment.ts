import { GracePeriod } from 'Investments/Domain/Investments/GracePeriod';
import { InvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

import { Fee, FeeSchema, VerificationFeeIds } from './Fee';
import { InvestmentsFeesStatus, InvestmentStatus, ScheduledBy } from './Types';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { JSONObjectOf } from 'HKEKTypes/Generics';

type InvestmentSchema = InvestmentsTable;

export type InvestmentWithFee = InvestmentSchema & {
  abortedDate: Date | null;
  approveDate: Date | null;
  approvedByIP: string | null;
  feeAmount: number | null;
  feeDateCreated: Date | null;
  feeId: string | null;
  feeStatus: InvestmentsFeesStatus | null;
  investmentId: string;
  verificationFeeIdsJson: JSONObjectOf<VerificationFeeIds> | null;
};

export class Investment {
  private accountId: string;
  private amount: number;
  private bankAccountId: string;
  private dateCreated: Date;
  private dateUpdated: Date;
  private id: string;
  private profileId: string;
  private recurringInvestmentId: string | null;
  private scheduledBy: ScheduledBy;
  private status: InvestmentStatus;
  private subscriptionAgreementId: string | null;
  private tradeId: string;
  private dateStarted: Date | null;
  private gracePeriod: GracePeriod;
  private portfolioId: string;
  private parentId: string | null;
  private fee: Fee | null;

  constructor(
    accountId: string,
    amount: number,
    bankAccountId: string,
    dateCreated: Date,
    dateUpdated: Date,
    id: string,
    profileId: string,
    recurringInvestmentId: string | null,
    scheduledBy: ScheduledBy,
    status: InvestmentStatus,
    subscriptionAgreementId: string | null,
    tradeId: string,
    dateStarted: Date | null,
    portfolioId: string,
    parentId: string | null,
  ) {
    this.accountId = accountId;
    this.amount = amount;
    this.bankAccountId = bankAccountId;
    this.dateCreated = dateCreated;
    this.dateUpdated = dateUpdated;
    this.id = id;
    this.profileId = profileId;
    this.recurringInvestmentId = recurringInvestmentId;
    this.scheduledBy = scheduledBy;
    this.status = status;
    this.subscriptionAgreementId = subscriptionAgreementId;
    this.tradeId = tradeId;
    this.dateStarted = dateStarted;
    this.portfolioId = portfolioId;
    this.parentId = parentId;
    this.gracePeriod = new GracePeriod(dateStarted);
    this.fee = null;
  }

  static create(investmentData: InvestmentWithFee) {
    const {
      accountId,
      amount,
      bankAccountId,
      dateCreated,
      dateUpdated,
      id,
      profileId,
      recurringInvestmentId,
      scheduledBy,
      status,
      subscriptionAgreementId,
      tradeId,
      dateStarted,
      portfolioId,
      parentId,
      feeId,
    } = investmentData;

    const investment = new Investment(
      accountId,
      amount,
      bankAccountId,
      dateCreated,
      dateUpdated,
      id,
      profileId,
      recurringInvestmentId,
      scheduledBy,
      status,
      subscriptionAgreementId,
      tradeId,
      dateStarted,
      portfolioId,
      parentId,
    );

    if (feeId) {
      const feeData = <FeeSchema>{
        approveDate: investmentData.approveDate ? DateTime.from(investmentData.approveDate) : null,
        abortedDate: investmentData.abortedDate ? DateTime.from(investmentData.abortedDate) : null,
        approvedByIP: investmentData.approvedByIP,
        accountId: investmentData.accountId,
        profileId: investmentData.profileId,
        amount: Money.lowPrecision(investmentData.feeAmount!),
        dateCreated: DateTime.from(investmentData.feeDateCreated!),
        id: investmentData.feeId,
        status: investmentData.feeStatus,
        investmentId: investmentData.investmentId,
        verificationFeeIds: investmentData.verificationFeeIdsJson!,
      };

      investment.setFee(Fee.restoreFromSchema(feeData));
    }

    return investment;
  }

  setFee(fee: Fee) {
    this.fee = fee;
  }

  getFee(): Fee | null {
    return this.fee;
  }

  assignSubscriptionAgreement(id: string) {
    this.subscriptionAgreementId = id;
  }

  updateStatus(status: InvestmentStatus) {
    this.status = status;
  }

  abort() {
    if (this.checkIfCanBeAborted()) {
      this.status = InvestmentStatus.ABORTED;

      if (this.fee) {
        this.fee.abort();
      }
    } else {
      throw new Error('INVESTMENT_CANNOT_BE_ABORTED');
    }
  }

  private checkIfCanBeAborted() {
    return (
      this.status === InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT ||
      this.status === InvestmentStatus.WAITING_FOR_FEES_APPROVAL ||
      this.status === InvestmentStatus.WAITING_FOR_INVESTMENT_START
    );
  }

  approveFee(ip: string) {
    this.fee?.approveFee(ip);
  }

  isFeeApproved() {
    if (!this.fee) {
      return true;
    }

    return this.fee.isApproved();
  }

  getSubscriptionAgreementId() {
    return this.subscriptionAgreementId;
  }

  startInvestment() {
    if (!this.isFeeApproved()) {
      return false;
    }

    this.dateStarted = new Date();
    this.gracePeriod = new GracePeriod(this.dateStarted);
    this.status = InvestmentStatus.IN_PROGRESS;

    return true;
  }

  isStartedInvestment() {
    return this.status === InvestmentStatus.IN_PROGRESS && this.dateStarted !== null;
  }

  toObject() {
    return {
      accountId: this.accountId,
      amount: this.amount,
      bankAccountId: this.bankAccountId,
      dateCreated: this.dateCreated,
      dateUpdated: this.dateUpdated,
      id: this.id,
      profileId: this.profileId,
      recurringInvestmentId: this.recurringInvestmentId,
      scheduledBy: this.scheduledBy,
      status: this.status,
      subscriptionAgreementId: this.subscriptionAgreementId,
      dateStarted: this.dateStarted,
      tradeId: this.tradeId,
      portfolioId: this.portfolioId,
      parentId: this.parentId,
    };
  }

  isGracePeriodEnded() {
    return this.gracePeriod.isGracePeriodEnded();
  }

  cancel(): boolean {
    if ([InvestmentStatus.IN_PROGRESS, InvestmentStatus.FUNDED].includes(this.status)) {
      this.status = InvestmentStatus.CANCELED;

      if (this.fee) {
        this.fee.abort();
      }

      return true;
    }

    if (this.status === InvestmentStatus.CANCELED) {
      return true;
    }

    return false;
  }
}
