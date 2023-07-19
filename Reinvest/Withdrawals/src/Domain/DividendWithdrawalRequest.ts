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
}
