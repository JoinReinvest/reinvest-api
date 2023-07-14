import { UUID } from 'HKEKTypes/Generics';
import { PropertyStatus } from 'Portfolio/Domain/types';

export interface PortfolioDatabaseSchema {
  adminJson: string;
  dataJson: string;
  dealpathJson: string;
  id: number;
  lastUpdate: Date;
  portfolioId: UUID;
  status: PropertyStatus;
}

export interface PortfolioTable {
  assetName: string;
  id: UUID;
  linkToOfferingCircular: string;
  name: string;
  northCapitalOfferingId: string;
  offeringName: string;
  status: 'ACTIVE';
  vertaloAllocationId: string;
}

export interface PortfolioNavTable {
  dateSynchronization: Date;
  id: UUID;
  numberOfShares: number;
  portfolioId: UUID;
  unitPrice: number;
}
