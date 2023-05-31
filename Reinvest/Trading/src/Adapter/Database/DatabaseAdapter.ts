import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { ReinvestmentTradesTable, TradesTable } from 'Trading/Adapter/Database/TradingSchema';

export const tradesTable = 'trading_trades';
export const reinvestmentTradesTable = 'trading_reinvestment_trades';

export interface TradingDatabase {
  [reinvestmentTradesTable]: ReinvestmentTradesTable;
  [tradesTable]: TradesTable;
}

export const TradingDatabaseAdapterInstanceProvider = 'TradingDatabaseAdapterProvider';
export type TradingDatabaseAdapterProvider = DatabaseProvider<TradingDatabase>;

export function createTradingDatabaseAdapterProvider(config: PostgreSQLConfig): TradingDatabaseAdapterProvider {
  return new DatabaseProvider<TradingDatabase>(config);
}
