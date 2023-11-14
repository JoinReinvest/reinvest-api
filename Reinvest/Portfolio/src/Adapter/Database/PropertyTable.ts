import { UUID } from "HKEKTypes/Generics";
import { PropertyStatus } from "Portfolio/Domain/types";

export interface PropertyTable {
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
  dateUpdated: Date;
  id: UUID;
  numberOfShares: number;
  portfolioId: UUID;
  unitNav: number;
}

export interface PortfolioUnitPriceTable {
  dateSynchronization: Date;
  id: UUID;
  numberOfSharesInOffering: number;
  portfolioId: UUID;
  unitPrice: number;
}

export interface PortfolioUpdatesTable {
  body: string;
  createdAt: Date;
  id: UUID;
  portfolioId: UUID;
  title: string;
}

export interface PortfolioAuthorsTable {
  id: UUID;
  name: string;
}
