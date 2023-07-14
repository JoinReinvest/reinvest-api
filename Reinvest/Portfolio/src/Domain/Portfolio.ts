import { UUID } from 'HKEKTypes/Generics';

export type PortfolioSchema = {
  assetName: string;
  id: UUID;
  linkToOfferingCircular: string;
  name: string;
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

  static create(
    id: UUID,
    name: string,
    northCapitalOfferingId: string,
    offeringName: string,
    vertaloAllocationId: string,
    assetName: string,
    linkToOfferingCircular: string,
  ): Portfolio {
    return new Portfolio({
      id,
      name,
      northCapitalOfferingId,
      offeringName,
      vertaloAllocationId,
      assetName,
      linkToOfferingCircular,
      status: 'ACTIVE',
    });
  }

  static restore(schema: PortfolioSchema) {
    return new Portfolio(schema);
  }

  toObject(): PortfolioSchema {
    return this.schema;
  }

  getOfferingId(): string {
    return this.schema.northCapitalOfferingId;
  }
}
