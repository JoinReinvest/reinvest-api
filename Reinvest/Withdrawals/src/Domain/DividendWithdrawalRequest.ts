import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export type DividendDetails = {
  amount: Money;
  id: UUID;
};

export type DividendRequestSchema = {
  accountId: UUID;
  dateCreated: Date;
  dateDecided: Date | null;
  dividendId: UUID;

  eligibleAmount: number;
  id: UUID;
  profileId: UUID;
  status: DividendWithdrawalDecision;
  withdrawalId: UUID | null;
};

export type DividendRequestView = {
  accountId: UUID;
  dateCreated: string;
  dateDecided: string | null;
  dividendId: UUID;
  eligibleAmount: string;
  id: UUID;
  profileId: UUID;
  status: DividendWithdrawalDecision;
};

export enum DividendWithdrawalDecision {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  AUTO_ACCEPTED = 'AUTO_ACCEPTED',
  REJECTED = 'REJECTED',
}

export class DividendWithdrawalRequest {
  private dividendRequestSchema: DividendRequestSchema;

  constructor(dividendRequestSchema: DividendRequestSchema) {
    this.dividendRequestSchema = dividendRequestSchema;
  }

  autoApprove() {
    if (this.dividendRequestSchema.status !== DividendWithdrawalDecision.REQUESTED) {
      throw new Error('Dividend is already actioned');
    }

    this.dividendRequestSchema.status = DividendWithdrawalDecision.AUTO_ACCEPTED;
    this.dividendRequestSchema.dateDecided = DateTime.now().toDate();
  }

  getId(): UUID {
    return this.dividendRequestSchema.id;
  }

  getObject(): DividendRequestSchema {
    return this.dividendRequestSchema;
  }

  assignWithdrawalId(id: UUID) {
    this.dividendRequestSchema.withdrawalId = id;
  }

  static restore(dividendRequestSchema: DividendRequestSchema): DividendWithdrawalRequest {
    return new DividendWithdrawalRequest(dividendRequestSchema);
  }

  static create(id: UUID, dividend: DividendDetails, profileId: UUID, accountId: UUID): DividendWithdrawalRequest {
    return new DividendWithdrawalRequest({
      accountId,
      dateCreated: DateTime.now().toDate(),
      dateDecided: null,
      dividendId: dividend.id,
      eligibleAmount: dividend.amount.getAmount(),
      id,
      withdrawalId: null,
      profileId,
      status: DividendWithdrawalDecision.REQUESTED,
    });
  }

  getView(): DividendRequestView {
    return {
      accountId: this.dividendRequestSchema.accountId,
      dateCreated: DateTime.from(this.dividendRequestSchema.dateCreated).toIsoDateTime(),
      dateDecided: this.dividendRequestSchema.dateDecided ? DateTime.from(this.dividendRequestSchema.dateDecided).toIsoDateTime() : null,
      dividendId: this.dividendRequestSchema.dividendId,
      eligibleAmount: Money.lowPrecision(this.dividendRequestSchema.eligibleAmount).getFormattedAmount(),
      id: this.dividendRequestSchema.id,
      profileId: this.dividendRequestSchema.profileId,
      status: this.dividendRequestSchema.status,
    };
  }

  forPayoutTemplate(): {
    accountId: UUID;
    amount: Money;
    profileId: UUID;
  } {
    return {
      profileId: this.dividendRequestSchema.profileId,
      accountId: this.dividendRequestSchema.accountId,
      amount: Money.lowPrecision(this.dividendRequestSchema.eligibleAmount),
    };
  }
}
