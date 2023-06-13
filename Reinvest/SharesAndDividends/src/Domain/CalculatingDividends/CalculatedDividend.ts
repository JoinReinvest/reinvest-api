import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { SharesStatus } from 'SharesAndDividends/Domain/Shares';

export enum CalculatedDividendStatus {
  AWAITING_DISTRIBUTION = 'AWAITING_DISTRIBUTION',
  DISTRIBUTED = 'DISTRIBUTED',
  LOCKED = 'LOCKED',
  REVOKED = 'REVOKED',
}

export type CalculatedDividendSchema = {
  accountId: UUID;
  calculationDate: Date;
  declarationId: UUID;
  dividendAmount: number;
  feeAmount: number;
  id: UUID;
  numberOfDaysInvestorOwnsShares: number;
  profileId: UUID;
  sharesId: UUID;
  status: CalculatedDividendStatus;
};

export class CalculatedDividend {
  private readonly id: UUID;
  private readonly accountId: UUID;
  private readonly profileId: UUID;
  private readonly sharesId: UUID;
  private readonly declarationId: UUID;
  private readonly calculationDate: Date;
  private readonly dividendAmount: Money;
  private readonly feeAmount: Money;
  private readonly numberOfDaysInvestorOwnsShares: number;
  private status: CalculatedDividendStatus;

  constructor(
    schema: null,
    id: UUID,
    dividendAmount: Money,
    feeAmount: Money,
    numberOfDaysInvestorOwnsShares: number,
    declarationId: UUID,
    accountId: UUID,
    profileId: UUID,
    sharesId: UUID,
    sharesStatus: SharesStatus,
  );
  constructor(schema: CalculatedDividendSchema);

  constructor(
    schema: CalculatedDividendSchema | null,
    id?: UUID,
    dividendAmount?: Money,
    feeAmount?: Money,
    numberOfDaysInvestorOwnsShares?: number,
    declarationId?: UUID,
    accountId?: UUID,
    profileId?: UUID,
    sharesId?: UUID,
    sharesStatus?: SharesStatus,
  ) {
    if (!schema) {
      this.id = id!;
      this.dividendAmount = dividendAmount!;
      this.feeAmount = feeAmount!;
      this.numberOfDaysInvestorOwnsShares = numberOfDaysInvestorOwnsShares!;
      this.declarationId = declarationId!;
      this.accountId = accountId!;
      this.profileId = profileId!;
      this.sharesId = sharesId!;
      this.calculationDate = new Date();
      this.status = this.mapSharesStatusToCalculatedDividendStatus(sharesStatus!);
    } else {
      this.id = schema.id;
      this.dividendAmount = new Money(schema.dividendAmount);
      this.feeAmount = new Money(schema.feeAmount);
      this.numberOfDaysInvestorOwnsShares = schema.numberOfDaysInvestorOwnsShares;
      this.declarationId = schema.declarationId;
      this.accountId = schema.accountId;
      this.profileId = schema.profileId;
      this.sharesId = schema.sharesId;
      this.calculationDate = schema.calculationDate;
      this.status = schema.status;
    }
  }

  static create(
    id: UUID,
    dividendAmount: Money,
    feeAmount: Money,
    numberOfDaysInvestorOwnsShares: number,
    declarationId: UUID,
    accountId: UUID,
    profileId: UUID,
    sharesId: UUID,
    sharesStatus: SharesStatus,
  ): CalculatedDividend {
    return new CalculatedDividend(
      null,
      id,
      dividendAmount,
      feeAmount,
      numberOfDaysInvestorOwnsShares,
      declarationId,
      accountId,
      profileId,
      sharesId,
      sharesStatus,
    );
  }

  static restore(data: CalculatedDividendSchema): CalculatedDividend {
    return new CalculatedDividend(data);
  }

  toObject(): CalculatedDividendSchema {
    return {
      id: this.id,
      dividendAmount: this.dividendAmount!.getAmount(),
      feeAmount: this.feeAmount!.getAmount(),
      numberOfDaysInvestorOwnsShares: this.numberOfDaysInvestorOwnsShares,
      declarationId: this.declarationId,
      accountId: this.accountId,
      profileId: this.profileId,
      sharesId: this.sharesId,
      calculationDate: this.calculationDate,
      status: this.status,
    };
  }

  getProfileId(): UUID {
    return this.profileId;
  }

  forCalculatingInvestorDividend(): {
    calculatedDividendId: UUID;
    dividend: Money;
    fee: Money;
    numberOfDays: number;
  } {
    return {
      dividend: this.dividendAmount,
      fee: this.feeAmount,
      numberOfDays: this.numberOfDaysInvestorOwnsShares,
      calculatedDividendId: this.id,
    };
  }

  markAsDistributed(): void {
    this.status = CalculatedDividendStatus.DISTRIBUTED;
  }

  private mapSharesStatusToCalculatedDividendStatus(sharesStatus: SharesStatus): CalculatedDividendStatus {
    if (this.status === CalculatedDividendStatus.DISTRIBUTED) {
      return this.status;
    }

    switch (sharesStatus) {
      case SharesStatus.CREATED:
      case SharesStatus.FUNDING:
      case SharesStatus.FUNDED:
        return CalculatedDividendStatus.LOCKED;
      case SharesStatus.SETTLED:
        return CalculatedDividendStatus.AWAITING_DISTRIBUTION;
      case SharesStatus.REVOKED:
        return CalculatedDividendStatus.REVOKED;
      default:
        return CalculatedDividendStatus.LOCKED;
    }
  }
}
