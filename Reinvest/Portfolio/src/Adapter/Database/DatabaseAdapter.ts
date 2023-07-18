import {
  PortfolioAuthorsTable,
  PortfolioNavTable,
  PortfolioTable,
  PropertyTable
} from 'Portfolio/Adapter/Database/PropertyTable';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { PortfolioUpdatesTable } from 'Reinvest/Portfolio/src/Adapter/Database/PropertyTable';

export const propertyTable = 'portfolio_property';
export const portfolioTable = 'portfolio_portfolio';
export const navTable = 'portfolio_nav';

export const updatesTable = 'portfolio_updates';
export const portfolioAuthorsTable = 'portfolio_authors';

export interface PortfolioDatabase {
  [navTable]: PortfolioNavTable;
  [portfolioTable]: PortfolioTable;
  [propertyTable]: PropertyTable;
  [updatesTable]: PortfolioUpdatesTable;
  [portfolioAuthorsTable]: PortfolioAuthorsTable;
}

export const PortfolioDatabaseAdapterInstanceProvider = 'PortfolioDatabaseAdapterProvider';
export type PortfolioDatabaseAdapterProvider = DatabaseProvider<PortfolioDatabase>;

export function createPortfolioDatabaseAdapterProvider(config: PostgreSQLConfig): PortfolioDatabaseAdapterProvider {
  return new DatabaseProvider<PortfolioDatabase>(config);
}
