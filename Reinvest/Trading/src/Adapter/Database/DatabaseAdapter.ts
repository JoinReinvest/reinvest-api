import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { TradesTable } from 'Trading/Adapter/Database/TradingSchema';

export const tradesTable = 'trading_trades';

export interface TradingDatabase {
  [tradesTable]: TradesTable;
}

export const TradingDatabaseAdapterInstanceProvider = 'TradingDatabaseAdapterProvider';
export type TradingDatabaseAdapterProvider = DatabaseProvider<TradingDatabase>;

export function createTradingDatabaseAdapterProvider(config: PostgreSQLConfig): TradingDatabaseAdapterProvider {
  return new DatabaseProvider<TradingDatabase>(config);
}
