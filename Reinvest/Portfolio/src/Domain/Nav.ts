import { IsoDateTimeString, MoneyView, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export type NavView = {
  dateSynchronization: IsoDateTimeString;
  numberOfShares: number;
  unitPrice: MoneyView;
};

export type NavSchema = {
  dateSynchronization: DateTime;
  id: UUID;
  numberOfShares: number;
  portfolioId: UUID;
  unitPrice: Money;
};

export class Nav {
  private schema: NavSchema;

  constructor(schema: NavSchema) {
    this.schema = schema;
  }

  static create(id: UUID, portfolioId: UUID, unitPrice: Money, numberOfShares: number) {
    return new Nav({
      id,
      numberOfShares,
      portfolioId,
      unitPrice,
      dateSynchronization: DateTime.now(),
    });
  }

  static restore(schema: NavSchema) {
    return new Nav(schema);
  }

  toObject(): NavSchema {
    return this.schema;
  }

  forView(): NavView {
    return {
      dateSynchronization: this.schema.dateSynchronization.toIsoDateTime(),
      numberOfShares: this.schema.numberOfShares,
      unitPrice: {
        value: this.schema.unitPrice.getAmount(),
        formatted: this.schema.unitPrice.getFormattedAmount(),
      },
    };
  }

  isTheSame(latestNav: Nav | null) {
    if (!latestNav) {
      return false;
    }

    const data = latestNav.toObject();

    return this.schema.numberOfShares === data.numberOfShares && this.schema.unitPrice.isEqual(data.unitPrice);
  }
}
