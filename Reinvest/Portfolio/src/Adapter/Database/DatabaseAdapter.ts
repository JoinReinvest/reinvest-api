import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export interface PortfolioDatabase {}

export const PortfolioDatabaseAdapterInstanceProvider = 'PortfolioDatabaseAdapterProvider';
export type PortfolioDatabaseAdapterProvider = DatabaseProvider<PortfolioDatabase>;

export function createPortfolioDatabaseAdapterProvider(config: PostgreSQLConfig): PortfolioDatabaseAdapterProvider {
  return new DatabaseProvider<PortfolioDatabase>(config);
}
