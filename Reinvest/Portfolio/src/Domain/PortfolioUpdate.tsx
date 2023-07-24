import { UUID } from '../../../../shared/hkek-types/Generics';

export type PortfolioUpdateSchema = {
  createdAt: Date;
  id: UUID;
  image: { id: string; url: string };
  portfolioId: UUID;
  title: string;
  body?: string;
  portfolioAuthorId: UUID;
};

export class PortfolioUpdate {
  private portfolioUpdateSchema: PortfolioUpdateSchema;

  constructor(portfolioUpdate: PortfolioUpdateSchema) {
    this.portfolioUpdateSchema = portfolioUpdate;
  }

  static create(schema: PortfolioUpdateSchema) {
    return new PortfolioUpdate(schema);
  }

  toObject(): PortfolioUpdateSchema {
    return this.portfolioUpdateSchema;
  }
}
