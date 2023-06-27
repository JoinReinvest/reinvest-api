import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

import { InvestmentsFeesStatus } from './Types';

export type FeeSchema = {
  accountId: UUID;
  amount: Money;
  approveDate: DateTime | null;
  approvedByIP: string | null;
  dateCreated: DateTime;
  id: UUID;
  investmentId: UUID;
  profileId: UUID;
  status: InvestmentsFeesStatus;
  verificationFeeIds: VerificationFeeIds;
};

export type VerificationFeeIds = {
  fees: {
    amount: number;
    verificationFeeId: string;
  }[];
};

export class Fee {
  private feeSchema: FeeSchema;

  constructor(feeSchema: FeeSchema) {
    this.feeSchema = feeSchema;
  }

  static create(accountId: UUID, amount: Money, id: string, investmentId: string, profileId: string, verificationFeeIds: VerificationFeeIds): Fee {
    return new Fee({
      accountId,
      amount,
      approveDate: null,
      approvedByIP: null,
      dateCreated: DateTime.now(),
      id,
      investmentId,
      profileId,
      status: InvestmentsFeesStatus.AWAITING,
      verificationFeeIds,
    });
  }

  static restoreFromSchema(feeSchema: FeeSchema): Fee {
    return new Fee(feeSchema);
  }

  approveFee() {
    this.feeSchema.approveDate = DateTime.now();
    this.feeSchema.status = InvestmentsFeesStatus.APPROVED;
  }

  getId() {
    return this.feeSchema.id;
  }

  abort() {
    this.feeSchema.status = InvestmentsFeesStatus.ABORTED;
  }

  isApproved() {
    return this.feeSchema.status === InvestmentsFeesStatus.APPROVED;
  }

  toObject() {
    return this.feeSchema;
  }
}
