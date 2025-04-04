import { UUID } from 'HKEKTypes/Generics';
import { GracePeriod } from 'Investments/Domain/Investments/GracePeriod';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

import { Fee } from './Fee';
import { InvestmentStatus, Origin } from './Types';

type InvestmentSchema = {
  accountId: UUID;
  amount: Money;
  bankAccountId: UUID;
  dateCreated: DateTime;
  dateStarted: DateTime | null;
  dateUpdated: DateTime;
  id: UUID;
  origin: Origin;
  originId: UUID | null;
  parentId: UUID | null;
  portfolioId: UUID;
  profileId: UUID;
  reason: string | null;
  status: InvestmentStatus;
  subscriptionAgreementId: UUID | null;
  tradeId: string;
  unitPrice: Money;
};

/**
 export enum InvestmentFailedReason {
  ACCOUNT_VERIFICATION_FAILED = 'ACCOUNT_VERIFICATION_FAILED',
  INVESTMENT_CANCELED = 'INVESTMENT_CANCELED',
  PAYMENT_MISMATCH = 'PAYMENT_MISMATCH',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVESTMENT_REJECTED_BY_PRINCIPAL = 'INVESTMENT_REJECTED_BY_PRINCIPAL',
}*/

export class Investment {
  private investmentSchema: InvestmentSchema;
  private fee: Fee | null;
  private gracePeriod: GracePeriod;

  constructor(investmentSchema: InvestmentSchema, fee: Fee | null) {
    this.investmentSchema = investmentSchema;
    this.fee = fee;
    this.gracePeriod = new GracePeriod(investmentSchema.dateStarted ? investmentSchema.dateStarted.toDate() : null);
  }

  static create(
    id: UUID,
    amount: Money,
    profileId: UUID,
    accountId: UUID,
    bankAccountId: UUID,
    portfolioId: UUID,
    tradeId: string,
    origin: Origin,
    originId: UUID | null,
    parentId: UUID | null,
    subscriptionAgreementId: UUID | null,
    fee: Fee | null,
    unitPrice: Money,
  ) {
    let status = InvestmentStatus.WAITING_FOR_INVESTMENT_START;

    if (!subscriptionAgreementId) {
      status = InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT;
    } else if (fee && !fee.isApproved()) {
      status = InvestmentStatus.WAITING_FOR_FEES_APPROVAL;
    }

    return new Investment(
      {
        accountId,
        amount,
        bankAccountId,
        dateCreated: DateTime.now(),
        dateUpdated: DateTime.now(),
        dateStarted: null,
        id,
        origin,
        originId,
        parentId,
        portfolioId,
        profileId,
        status,
        subscriptionAgreementId,
        tradeId,
        reason: null,
        unitPrice,
      },
      fee,
    );
  }

  static restore(investmentSchema: InvestmentSchema, fee: Fee | null = null) {
    return new Investment(investmentSchema, fee);
  }

  setFee(fee: Fee) {
    this.fee = fee;
  }

  getFee(): Fee | null {
    return this.fee;
  }

  assignSubscriptionAgreement(id: string) {
    if (!this.investmentSchema.subscriptionAgreementId) {
      this.investmentSchema.subscriptionAgreementId = id;
      this.evaluateStatusBeforeStarted();
    }
  }

  abort() {
    if (this.checkIfCanBeAborted()) {
      this.investmentSchema.status = InvestmentStatus.ABORTED;

      if (this.fee) {
        this.fee.abort();
      }
    } else {
      throw new Error('INVESTMENT_CANNOT_BE_ABORTED');
    }
  }

  private checkIfCanBeAborted() {
    return (
      this.investmentSchema.status === InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT ||
      this.investmentSchema.status === InvestmentStatus.WAITING_FOR_FEES_APPROVAL ||
      this.investmentSchema.status === InvestmentStatus.WAITING_FOR_INVESTMENT_START
    );
  }

  approveFee(ip: string) {
    if (this.fee && !this.fee.isApproved()) {
      this.fee?.approveFee(ip);
    }
  }

  isFeeApproved() {
    if (!this.fee) {
      return true;
    }

    return this.fee.isApproved();
  }

  startInvestment(ignoreFee = false): boolean {
    if (this.isStartedInvestment()) {
      return false;
    }

    if (!ignoreFee && !this.isFeeApproved()) {
      return false;
    }

    if (!this.isSubscriptionAgreementAssigned()) {
      return false;
    }

    this.investmentSchema.dateStarted = DateTime.now();
    this.gracePeriod = new GracePeriod(this.investmentSchema.dateStarted.toDate());
    this.investmentSchema.status = InvestmentStatus.IN_PROGRESS;

    return true;
  }

  private isSubscriptionAgreementAssigned(): boolean {
    return this.investmentSchema.subscriptionAgreementId !== null;
  }

  isStartedInvestment() {
    return this.investmentSchema.dateStarted !== null;
  }

  toObject(): InvestmentSchema {
    return this.investmentSchema;
  }

  isGracePeriodEnded() {
    return this.gracePeriod.isGracePeriodEnded();
  }

  cancel(): boolean {
    if ([InvestmentStatus.IN_PROGRESS, InvestmentStatus.FUNDED].includes(this.investmentSchema.status)) {
      this.investmentSchema.status = InvestmentStatus.CANCELING;

      if (this.fee) {
        this.fee.abort();
      }

      return true;
    }

    if ([InvestmentStatus.CANCELED, InvestmentStatus.CANCELING].includes(this.investmentSchema.status)) {
      return false;
    }

    throw new Error('INVESTMENT_CANNOT_BE_CANCELED');
  }

  /**
   * It creates new investment and copy all data from current investment
   * It overrides accountId of current investment for the new account
   */
  transferInvestment(investmentTransferId: UUID, transferToAccountId: UUID): Investment {
    const investmentToTransfer = { ...this.toObject() };
    investmentToTransfer.id = investmentTransferId;
    investmentToTransfer.status = InvestmentStatus.TRANSFERRED;
    investmentToTransfer.origin = Origin.TRANSFER;
    investmentToTransfer.originId = this.investmentSchema.id;
    this.investmentSchema.accountId = transferToAccountId;
    this.investmentSchema.parentId = null;

    return Investment.restore(investmentToTransfer);
  }

  getId(): UUID {
    return this.investmentSchema.id;
  }

  private evaluateStatusBeforeStarted() {
    if (this.investmentSchema.dateStarted) {
      return;
    }

    if (!this.investmentSchema.subscriptionAgreementId) {
      this.investmentSchema.status = InvestmentStatus.WAITING_FOR_SUBSCRIPTION_AGREEMENT;

      return;
    }

    if (!this.isFeeApproved()) {
      this.investmentSchema.status = InvestmentStatus.WAITING_FOR_FEES_APPROVAL;

      return;
    }

    this.investmentSchema.status = InvestmentStatus.WAITING_FOR_INVESTMENT_START;
  }

  isTransferred(): boolean {
    return this.investmentSchema.status === InvestmentStatus.TRANSFERRED;
  }

  getOriginId(): UUID {
    if (!this.investmentSchema.originId) {
      throw new Error('INVESTMENT_ORIGIN_ID_NOT_SET');
    }

    return this.investmentSchema.originId;
  }

  fund(): void {
    this.investmentSchema.status = InvestmentStatus.FUNDED;
    this.investmentSchema.dateUpdated = DateTime.now();
  }

  completeCancellation(): void {
    this.investmentSchema.status = InvestmentStatus.CANCELED;
    this.investmentSchema.dateUpdated = DateTime.now();
  }

  complete(): boolean {
    if (this.investmentSchema.status === InvestmentStatus.FINISHED) {
      return false;
    }

    this.investmentSchema.status = InvestmentStatus.FINISHED;
    this.investmentSchema.dateUpdated = DateTime.now();

    return true;
  }

  settlingStarted() {
    this.investmentSchema.status = InvestmentStatus.SETTLING;
    this.investmentSchema.dateUpdated = DateTime.now();
  }

  revert(): boolean {
    if (this.investmentSchema.status === InvestmentStatus.REVERTED) {
      return false;
    }

    this.investmentSchema.status = InvestmentStatus.REVERTED;
    this.investmentSchema.dateUpdated = DateTime.now();

    return true;
  }

  getFormattedUnitPrice(): string {
    return this.investmentSchema.unitPrice.getFormattedAmount();
  }

  private getFeeAmount(): Money {
    if (!this.fee) {
      return Money.zero();
    }

    return this.fee.toObject().amount;
  }

  forInvestmentEvent() {
    return {
      accountId: this.investmentSchema.accountId,
      tradeId: this.investmentSchema.tradeId,
      origin: this.investmentSchema.origin,
      investmentId: this.investmentSchema.id,
      amount: this.investmentSchema.amount.getAmount(),
      fee: this.getFeeAmount().getAmount(),
    };
  }

  getProfileId(): UUID {
    return this.investmentSchema.profileId;
  }
}
