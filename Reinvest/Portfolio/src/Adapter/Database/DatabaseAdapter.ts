import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

import { PropertySchema } from './PropertySchema';

export const propertyTable = 'portfolio_property';

export interface PortfolioDatabase {
  [propertyTable]: PropertySchema;
}

export const PortfolioDatabaseAdapterInstanceProvider = 'PortfolioDatabaseAdapterProvider';
export type PortfolioDatabaseAdapterProvider = DatabaseProvider<PortfolioDatabase>;

export function createPortfolioDatabaseAdapterProvider(config: PostgreSQLConfig): PortfolioDatabaseAdapterProvider {
  return new DatabaseProvider<PortfolioDatabase>(config);
}
