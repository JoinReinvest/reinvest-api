import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export enum SharesStatus {
  CREATED = 'CREATED',
  FUNDING = 'FUNDING',
  FUNDED = 'FUNDED',
  SETTLED = 'SETTLED',
  REVOKED = 'REVOKED',
}

export enum SharesOrigin {
  INVESTMENT = 'INVESTMENT',
  DIVIDEND = 'DIVIDEND',
}

export type SharesSchema = {
  accountId: UUID;
  dateCreated: Date;
  dateFunded: Date | null;
  dateFunding: Date | null;
  dateRevoked: Date | null;
  dateSettled: Date | null;
  id: UUID;
  numberOfShares: number | null;
  origin: SharesOrigin;
  originId: UUID;
  portfolioId: UUID;
  price: number;
  profileId: UUID;
  status: SharesStatus;
  transferredFrom: UUID | null;
  unitPrice: number | null;
};

export class Shares {
  private sharesSchema: SharesSchema;

  constructor(sharesSchema: SharesSchema) {
    this.sharesSchema = sharesSchema;
  }

  static create(id: UUID, portfolioId: UUID, profileId: UUID, accountId: UUID, originId: UUID, price: Money, origin: SharesOrigin): Shares {
    return new Shares({
      accountId,
      dateCreated: DateTime.now().toDate(),
      dateFunding: null,
      dateFunded: null,
      dateRevoked: null,
      dateSettled: null,
      id,
      originId,
      origin,
      numberOfShares: null,
      portfolioId,
      price: price.getAmount(),
      profileId,
      status: SharesStatus.CREATED,
      transferredFrom: null,
      unitPrice: null,
    });
  }

  static restore(data: SharesSchema): Shares {
    return new Shares(data);
  }

  toObject(): SharesSchema {
    return this.sharesSchema;
  }

  setFundingState(shares: number, unitPrice: Money) {
    if (this.sharesSchema.status !== SharesStatus.CREATED) {
      throw new Error('Shares status must be CREATED');
    }

    this.sharesSchema.status = SharesStatus.FUNDING;
    this.sharesSchema.dateFunding = DateTime.now().toDate();
    this.sharesSchema.numberOfShares = shares;
    this.sharesSchema.unitPrice = unitPrice.getAmount();
  }

  setFundedState() {
    if (this.sharesSchema.status !== SharesStatus.FUNDING) {
      throw new Error('Shares status must be FUNDING');
    }

    this.sharesSchema.status = SharesStatus.FUNDED;
    this.sharesSchema.dateFunded = DateTime.now().toDate();
  }

  setSettledState() {
    if (this.sharesSchema.status !== SharesStatus.FUNDED) {
      throw new Error('Shares status must be FUNDED');
    }

    this.sharesSchema.status = SharesStatus.SETTLED;
    this.sharesSchema.dateSettled = DateTime.now().toDate();
  }

  setRevokedState() {
    this.sharesSchema.status = SharesStatus.REVOKED;
    this.sharesSchema.dateRevoked = DateTime.now().toDate();
  }

  forDividendCalculation(): {
    accountId: UUID;
    dateFunding: DateTime;
    numberOfShares: number;
    profileId: UUID;
    sharesId: UUID;
    sharesStatus: SharesStatus;
  } {
    return {
      numberOfShares: this.sharesSchema.numberOfShares!,
      dateFunding: DateTime.fromIsoDate(this.sharesSchema.dateFunding!),
      sharesId: this.sharesSchema.id,
      accountId: this.sharesSchema.accountId,
      profileId: this.sharesSchema.profileId,
      sharesStatus: this.sharesSchema.status,
    };
  }

  forFinancialOperation(): {
    accountId: UUID;
    numberOfShares: number;
    originId: UUID;
    portfolioId: UUID;
    profileId: UUID;
    unitPrice: number;
  } {
    return {
      accountId: this.sharesSchema.accountId,
      numberOfShares: this.sharesSchema.numberOfShares!,
      originId: this.sharesSchema.id,
      portfolioId: this.sharesSchema.portfolioId,
      profileId: this.sharesSchema.profileId,
      unitPrice: this.sharesSchema.unitPrice!,
    };
  }

  forSharesChangedEvent(): {
    profileId: UUID;
  } {
    return {
      profileId: this.sharesSchema.profileId,
    };
  }

  getId(): UUID {
    return this.sharesSchema.id;
  }

  calculateFeeAmountForShares(numberOfDaysInvestorOwnsShares: number): Money {
    if (numberOfDaysInvestorOwnsShares === 0) {
      return Money.zero();
    }

    const DAYS_IN_YEAR = 365;
    const ONE_PERCENT = 0.01;

    const price = Money.lowPrecision(this.sharesSchema.price).increasePrecision();
    const onePercentOfPricePerYear = price.multiplyBy(ONE_PERCENT).divideBy(DAYS_IN_YEAR);

    return onePercentOfPricePerYear.multiplyBy(numberOfDaysInvestorOwnsShares).decreasePrecision();
  }

  isTransferred(): boolean {
    return this.sharesSchema.transferredFrom !== null;
  }

  getTransferredFromId(): UUID {
    if (!this.isTransferred()) {
      throw new Error('Shares has not been transferred');
    }

    return this.sharesSchema.transferredFrom!;
  }

  getOriginId(): UUID {
    return this.sharesSchema.originId;
  }

  transferShare(newShareTransferId: UUID, transferToAccountId: UUID, newOriginId: UUID): Shares {
    const transferredSchema = { ...this.toObject() };

    transferredSchema.id = newShareTransferId;
    transferredSchema.originId = newOriginId;
    transferredSchema.transferredFrom = this.getId();
    transferredSchema.status = SharesStatus.REVOKED;

    this.sharesSchema.accountId = transferToAccountId;

    return Shares.restore(transferredSchema);
  }

  isRevoked(): boolean {
    return this.sharesSchema.status === SharesStatus.REVOKED;
  }

  isCreated(): boolean {
    return this.sharesSchema.status === SharesStatus.CREATED;
  }

  getNumberOfShares(): number {
    return this.sharesSchema.numberOfShares!;
  }

  getPrice(): number {
    return this.sharesSchema.price;
  }
}
