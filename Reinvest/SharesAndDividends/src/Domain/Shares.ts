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

  toObject(): SharesSchema {
    return this.sharesSchema;
  }
}
