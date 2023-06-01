export enum SharesStatus {
  CREATED = 'CREATED',
  FUNDING = 'FUNDING',
  FUNDED = 'FUNDED',
  SETTLED = 'SETTLED',
  REVOKED = 'REVOKED',
}

export type SharesSchema = {
  accountId: string;
  dateCreated: Date;
  dateFunded: Date | null;
  dateRevoked: Date | null;
  dateSettled: Date | null;
  id: string;
  investmentId: string;
  numberOfShares: number | null;
  portfolioId: string;
  price: number;
  profileId: string;
  status: SharesStatus;
  unitPrice: number | null;
};

export class Shares {
  private sharesSchema: SharesSchema;

  constructor(sharesSchema: SharesSchema) {
    this.sharesSchema = sharesSchema;
  }

  static create(id: string, portfolioId: string, profileId: string, accountId: string, investmentId: string, price: number): Shares {
    return new Shares({
      accountId,
      dateCreated: new Date(),
      dateFunded: null,
      dateRevoked: null,
      dateSettled: null,
      id,
      investmentId,
      numberOfShares: null,
      portfolioId,
      price,
      profileId,
      status: SharesStatus.CREATED,
      unitPrice: null,
    });
  }

  static restore(data: SharesSchema): Shares {
    const { accountId, dateCreated, dateFunded, dateRevoked, dateSettled, id, investmentId, numberOfShares, portfolioId, price, profileId, status, unitPrice } =
      data;

    return new Shares({
      accountId,
      dateCreated,
      dateFunded,
      dateRevoked,
      dateSettled,
      id,
      investmentId,
      numberOfShares,
      portfolioId,
      price,
      profileId,
      status,
      unitPrice,
    });
  }

  toObject(): SharesSchema {
    return this.sharesSchema;
  }

  setFundingState(shares: number, unitPrice: number) {
    if (this.sharesSchema.status !== SharesStatus.CREATED) {
      throw new Error('Shares status must be CREATED');
    }

    this.sharesSchema.status = SharesStatus.FUNDING;
    this.sharesSchema.numberOfShares = shares;
    this.sharesSchema.unitPrice = unitPrice;
  }

  setFundedState() {
    if (this.sharesSchema.status !== SharesStatus.FUNDING) {
      throw new Error('Shares status must be FUNDING');
    }

    this.sharesSchema.status = SharesStatus.FUNDED;
    this.sharesSchema.dateFunded = new Date();
  }

  setSettledState() {
    if (this.sharesSchema.status !== SharesStatus.FUNDED) {
      throw new Error('Shares status must be FUNDED');
    }

    this.sharesSchema.status = SharesStatus.SETTLED;
    this.sharesSchema.dateSettled = new Date();
  }
}
