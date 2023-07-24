import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';
import { VerifierType } from 'Verification/Domain/ValueObject/Verifiers';

const VERIFICATION_FEE_FOR_MANUAL_KYC_IN_CENTS = 1000; // $10
const VERIFICATION_FEE_FOR_MANUAL_KYB_IN_CENTS = 2500; // $25

export enum VerificationFeeStatus {
  ASSIGNED = 'ASSIGNED',
  NOT_ASSIGNED = 'NOT_ASSIGNED',
  PARTIALLY_ASSIGNED = 'PARTIALLY_ASSIGNED',
}

export type VerificationFeeSchema = {
  accountId: UUID | null;
  amount: Money;
  amountAssigned: Money;
  dateCreated: DateTime;
  decisionId: string;
  id: UUID;
  profileId: UUID | null;
  status: VerificationFeeStatus;
};

export class VerificationFee {
  private verificationFeeSchema: VerificationFeeSchema;

  constructor(verificationFeeSchema: VerificationFeeSchema) {
    this.verificationFeeSchema = verificationFeeSchema;
  }

  static create(id: UUID, decisionId: string, amount: Money, profileId: UUID | null, accountId: UUID | null) {
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

  static getFeeForType(type: VerifierType) {
    switch (type) {
      case VerifierType.PROFILE:
        return Money.lowPrecision(VERIFICATION_FEE_FOR_MANUAL_KYC_IN_CENTS);
      case VerifierType.STAKEHOLDER:
        return Money.zero();
      case VerifierType.COMPANY:
        return Money.lowPrecision(VERIFICATION_FEE_FOR_MANUAL_KYB_IN_CENTS);
      default:
        console.error(`Unknown verifier type ${type} when asking for verification fee`);

        return Money.zero();
    }
  }

  toObject(): VerificationFeeSchema {
    return this.verificationFeeSchema;
  }

  // it returns paid amount
  payToInvestmentAmount(maxAmount: Money): Money {
    const amountLeftToPay = this.verificationFeeSchema.amount.subtract(this.verificationFeeSchema.amountAssigned);

    if (amountLeftToPay.isZero()) {
      this.verificationFeeSchema.status = VerificationFeeStatus.ASSIGNED;

      return Money.zero();
    }

    if (amountLeftToPay.isGreaterThan(maxAmount)) {
      this.verificationFeeSchema.status = VerificationFeeStatus.PARTIALLY_ASSIGNED;
      this.verificationFeeSchema.amountAssigned = this.verificationFeeSchema.amountAssigned.add(maxAmount);

      return maxAmount;
    } else {
      this.verificationFeeSchema.status = VerificationFeeStatus.ASSIGNED;
      this.verificationFeeSchema.amountAssigned = this.verificationFeeSchema.amountAssigned.add(amountLeftToPay);

      return amountLeftToPay;
    }
  }

  withdraw(amount: Money): void {
    this.verificationFeeSchema.amountAssigned = this.verificationFeeSchema.amountAssigned.subtract(amount);
    this.verificationFeeSchema.status = this.verificationFeeSchema.amountAssigned.isZero()
      ? VerificationFeeStatus.NOT_ASSIGNED
      : VerificationFeeStatus.PARTIALLY_ASSIGNED;
  }

  getId(): UUID {
    return this.verificationFeeSchema.id;
  }
}
