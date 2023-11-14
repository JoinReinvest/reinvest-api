import { IsoDateTimeString, MoneyView, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

export type NavView = {
  dateUpdated: IsoDateTimeString;
  numberOfShares: number;
  unitNav: MoneyView;
};

export type NavSchema = {
  dateUpdated: DateTime;
  id: UUID;
  numberOfShares: number;
  portfolioId: UUID;
  unitNav: Money;
};

export class Nav {
  private schema: NavSchema;

  constructor(schema: NavSchema) {
    this.schema = schema;
  }

  static create(id: UUID, portfolioId: UUID, unitNav: Money, numberOfShares: number) {
    return new Nav({
      id,
      numberOfShares,
      portfolioId,
      unitNav,
      dateUpdated: DateTime.now(),
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
      dateUpdated: this.schema.dateUpdated.toIsoDateTime(),
      numberOfShares: this.schema.numberOfShares,
      unitNav: {
        value: this.schema.unitNav.getAmount(),
        formatted: this.schema.unitNav.getFormattedAmount(),
      },
    };
  }

  isTheSame(latestNav: Nav | null) {
    if (!latestNav) {
      return false;
    }

    const data = latestNav.toObject();

    return this.schema.numberOfShares === data.numberOfShares && this.schema.unitNav.isEqual(data.unitNav);
  }
}
