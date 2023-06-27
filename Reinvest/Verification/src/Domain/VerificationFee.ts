import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { DateTime } from 'Money/DateTime';

export enum VerificationFeeStatus {
  ASSIGNED = 'ASSIGNED',
  NOT_ASSIGNED = 'NOT_ASSIGNED',
  PARTIALLY_ASSIGNED = 'PARTIALLY_ASSIGNED',
}

export type VerificationFeeSchema = {
  accountId: UUID;
  amount: Money;
  amountAssigned: Money;
  dateCreated: DateTime;
  decisionId: string;
  id: UUID;
  profileId: UUID;
  status: VerificationFeeStatus;
};

export class VerificationFee {
  private verificationFeeSchema: VerificationFeeSchema;

  constructor(verificationFeeSchema: VerificationFeeSchema) {
    this.verificationFeeSchema = verificationFeeSchema;
  }

  static create(id: UUID, profileId: UUID, accountId: UUID, decisionId: string, amount: Money) {
    return new VerificationFee({
      accountId,
      amount,
      amountAssigned: Money.zero(),
      dateCreated: DateTime.now(),
      decisionId,
      id,
      profileId,
      status: VerificationFeeStatus.NOT_ASSIGNED,
    });
  }

  static createFromSchema(verificationFeeSchema: VerificationFeeSchema) {
    return new VerificationFee(verificationFeeSchema);
  }

  toObject(): VerificationFeeSchema {
    return this.verificationFeeSchema;
  }
}
