import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

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

  static create(schema: NavSchema) {
    return new Nav(schema);
  }

  static restore(schema: NavSchema) {
    return new Nav(schema);
  }

  toObject(): NavSchema {
    return this.schema;
  }
}
