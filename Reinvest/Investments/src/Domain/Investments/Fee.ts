import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

import { InvestmentsFeesStatus } from './Types';

export type FeeSchema = {
  abortedDate: DateTime | null;
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

export type VerificationReference = {
  amount: number;
  verificationFeeId: UUID;
};

export type VerificationFeeIds = {
  fees: VerificationReference[];
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
      abortedDate: null,
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

  approveFee(ip: string): void {
    this.feeSchema.approveDate = DateTime.now();
    this.feeSchema.status = InvestmentsFeesStatus.APPROVED;
    this.feeSchema.approvedByIP = ip;
  }

  getId(): UUID {
    return this.feeSchema.id;
  }

  abort(): void {
    this.feeSchema.status = InvestmentsFeesStatus.ABORTED;
    this.feeSchema.abortedDate = DateTime.now();
  }

  isApproved(): boolean {
    return this.feeSchema.status === InvestmentsFeesStatus.APPROVED;
  }

  toObject(): FeeSchema {
    return this.feeSchema;
  }
}
