import { IsoDateTimeString, MoneyView, UUID } from "HKEKTypes/Generics";
import { DateTime } from "Money/DateTime";
import { Money } from "Money/Money";

export type UnitPriceView = {
  dateSynchronization: IsoDateTimeString;
  numberOfSharesInOffering: number;
  unitPrice: MoneyView;
};

export type UnitPriceSchema = {
  dateSynchronization: DateTime;
  id: UUID;
  numberOfSharesInOffering: number;
  portfolioId: UUID;
  unitPrice: Money;
};

export class UnitPrice {
  private schema: UnitPriceSchema;

  constructor(schema: UnitPriceSchema) {
    this.schema = schema;
  }

  static create(id: UUID, portfolioId: UUID, unitPrice: Money, numberOfSharesInOffering: number) {
    return new UnitPrice({
      id,
      numberOfSharesInOffering,
      portfolioId,
      unitPrice,
      dateSynchronization: DateTime.now(),
    });
  }

  static restore(schema: UnitPriceSchema) {
    return new UnitPrice(schema);
  }

  toObject(): UnitPriceSchema {
    return this.schema;
  }

  forView(): UnitPriceView {
    return {
      dateSynchronization: this.schema.dateSynchronization.toIsoDateTime(),
      numberOfSharesInOffering: this.schema.numberOfSharesInOffering,
      unitPrice: {
        value: this.schema.unitPrice.getAmount(),
        formatted: this.schema.unitPrice.getFormattedAmount(),
      },
    };
  }

  isTheSame(latestUnitPrice: UnitPrice | null) {
    if (!latestUnitPrice) {
      return false;
    }

    const data = latestUnitPrice.toObject();

    return this.schema.numberOfSharesInOffering === data.numberOfSharesInOffering && this.schema.unitPrice.isEqual(data.unitPrice);
  }
}
