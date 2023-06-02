import { GracePeriod } from 'Investments/Domain/Investments/GracePeriod';
import { InvestmentsTable } from 'Investments/Infrastructure/Adapters/PostgreSQL/InvestmentsSchema';

import { Fee, FeeSchema } from './Fee';
import { InvestmentsFeesStatus, InvestmentStatus, ScheduledBy } from './Types';

type InvestmentSchema = InvestmentsTable;

export type InvestmentWithFee = InvestmentSchema & {
  approveDate: Date | null;
  approvedByIP: string | null;
  feeAmount: number | null;
  feeDateCreated: Date | null;
  feeId: string | null;
  feeStatus: InvestmentsFeesStatus | null;
  investmentId: string;
  verificationFeeId: string;
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
      const feeData = {
        approveDate: investmentData.approveDate,
        approvedByIP: investmentData.approvedByIP,
        amount: investmentData.feeAmount,
        dateCreated: investmentData.feeDateCreated,
        id: investmentData.feeId,
        status: investmentData.feeStatus,
        investmentId: investmentData.investmentId,
        verificationFeeId: investmentData.verificationFeeId,
      } as FeeSchema;

      investment.setFee(Fee.create(feeData));
    }

    return investment;
  }

  setFee(fee: Fee) {
    this.fee = fee;
  }

  getFee() {
    return this.fee;
  }

  assignSubscriptionAgreement(id: string) {
    this.subscriptionAgreementId = id;
  }

  updateStatus(status: InvestmentStatus) {
    this.status = status;
  }

  abort() {
    this.status = InvestmentStatus.FINISHED;

    if (this.fee) {
      this.fee.abort();
    }
  }

  hasFee() {
    return !!this.fee;
  }

  approveFee() {
    this.fee?.approveFee();
  }

  isFeeApproved() {
    return this.fee?.isApproved();
  }

  getSubscriptionAgreementId() {
    return this.subscriptionAgreementId;
  }

  startInvestment() {
    this.dateStarted = new Date();
    this.gracePeriod = new GracePeriod(this.dateStarted);
    this.status = InvestmentStatus.IN_PROGRESS;
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
}
