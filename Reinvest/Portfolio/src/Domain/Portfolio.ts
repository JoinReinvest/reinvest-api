import { UUID } from 'HKEKTypes/Generics';

export type PortfolioSchema = {
  assetName: string;
  id: UUID;
  linkToOfferingCircular: string;
  northCapitalOfferingId: string;
  offeringName: string;
  status: 'ACTIVE';
  vertaloAllocationId: string;
};

export class Portfolio {
  private schema: PortfolioSchema;

  constructor(schema: PortfolioSchema) {
    this.schema = schema;
  }

  static create(schema: PortfolioSchema) {
    return new Portfolio(schema);
  }

  static restore(schema: PortfolioSchema) {
    return new Portfolio(schema);
  }

  toObject(): PortfolioSchema {
    return this.schema;
  }
}
