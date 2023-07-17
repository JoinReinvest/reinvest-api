import { PortfolioDatabaseSchema, PortfolioNavTable, PortfolioTable } from 'Portfolio/Adapter/Database/PortfolioDatabaseSchema';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const propertyTable = 'portfolio_property';
export const portfolioTable = 'portfolio_portfolio';
export const navTable = 'portfolio_nav';

export interface PortfolioDatabase {
  [navTable]: PortfolioNavTable;
  [portfolioTable]: PortfolioTable;
  [propertyTable]: PortfolioDatabaseSchema;
}

export const PortfolioDatabaseAdapterInstanceProvider = 'PortfolioDatabaseAdapterProvider';
export type PortfolioDatabaseAdapterProvider = DatabaseProvider<PortfolioDatabase>;

export function createPortfolioDatabaseAdapterProvider(config: PostgreSQLConfig): PortfolioDatabaseAdapterProvider {
  return new DatabaseProvider<PortfolioDatabase>(config);
}
