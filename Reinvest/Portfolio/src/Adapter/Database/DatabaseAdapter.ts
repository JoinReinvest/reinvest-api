import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

import {PropertySchema, UpdatesSchema} from './PropertySchema';

export const propertyTable = 'portfolio_property';
export const updatesTable = 'portfolio_updates';

export interface PortfolioDatabase {
  [propertyTable]: PropertySchema;
  [updatesTable]: UpdatesSchema;
}

export const PortfolioDatabaseAdapterInstanceProvider = 'PortfolioDatabaseAdapterProvider';
export type PortfolioDatabaseAdapterProvider = DatabaseProvider<PortfolioDatabase>;

export function createPortfolioDatabaseAdapterProvider(config: PostgreSQLConfig): PortfolioDatabaseAdapterProvider {
  return new DatabaseProvider<PortfolioDatabase>(config);
}
