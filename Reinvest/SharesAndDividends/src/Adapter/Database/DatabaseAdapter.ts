import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import { SharesTable } from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';

export const sadShares = 'sad_shares';

export interface SharesAndDividendsDatabase {
  [sadShares]: SharesTable;
}

export const SharesAndDividendsDatabaseAdapterInstanceProvider = 'SharesAndDividendsDatabaseAdapterProvider';
export type SharesAndDividendsDatabaseAdapterProvider = DatabaseProvider<SharesAndDividendsDatabase>;

export function createSharesAndDividendsDatabaseAdapterProvider(config: PostgreSQLConfig): SharesAndDividendsDatabaseAdapterProvider {
  return new DatabaseProvider<SharesAndDividendsDatabase>(config);
}
