import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';
import {
  CalculatedDividendsTable,
  DividendDistributionTable,
  DividendsDeclarationTable,
  FinancialOperationsTable,
  GlobalFinancialOperationsTable,
  InvestorDividendsTable,
  InvestorIncentiveDividendTable,
  SharesTable,
  UnpaidFeesTable,
} from 'SharesAndDividends/Adapter/Database/SharesAndDividendsSchema';

export const sadSharesTable = 'sad_shares';
export const sadDividendsDeclarationsTable = 'sad_dividend_declaration';
export const sadCalculatedDividendsTable = 'sad_calculated_dividends';
export const sadDividendDistributionTable = 'sad_dividend_distribution';
export const sadInvestorDividendsTable = 'sad_investor_dividends';
export const sadUnpaidFeesTable = 'sad_unpaid_fees';
export const sadInvestorIncentiveDividendTable = 'sad_investor_incentive_dividend';
export const sadFinancialOperationsTable = 'sad_financial_operations';
export const sadGlobalFinancialOperationsTable = 'sad_global_financial_operations';

export interface SharesAndDividendsDatabase {
  [sadCalculatedDividendsTable]: CalculatedDividendsTable;
  [sadDividendDistributionTable]: DividendDistributionTable;
  [sadDividendsDeclarationsTable]: DividendsDeclarationTable;
  [sadFinancialOperationsTable]: FinancialOperationsTable;
  [sadGlobalFinancialOperationsTable]: GlobalFinancialOperationsTable;
  [sadInvestorDividendsTable]: InvestorDividendsTable;
  [sadInvestorIncentiveDividendTable]: InvestorIncentiveDividendTable;
  [sadSharesTable]: SharesTable;
  [sadUnpaidFeesTable]: UnpaidFeesTable;
}

export const SharesAndDividendsDatabaseAdapterInstanceProvider = 'SharesAndDividendsDatabaseAdapterProvider';
export type SharesAndDividendsDatabaseAdapterProvider = DatabaseProvider<SharesAndDividendsDatabase>;

export function createSharesAndDividendsDatabaseAdapterProvider(config: PostgreSQLConfig): SharesAndDividendsDatabaseAdapterProvider {
  return new DatabaseProvider<SharesAndDividendsDatabase>(config);
}
