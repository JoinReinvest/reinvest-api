import { JSONObject } from 'HKEKTypes/Generics';

export interface SharesTable {
  accountId: string;
  dateCreated: Date;
  dateFunded: Date | null;
  dateRevoked: Date | null;
  dateSettled: Date | null;
  id: string;
  investmentId: string;
  numberOfShares: number;
  price: number;
  profileId: string;
  status: 'CREATED' | 'FUNDING' | 'FUNDED' | 'SETTLED' | 'REVOKED';
  unitPrice: number;
}

export interface DividendsDeclarationTable {
  calculatedFromDate: Date;
  calculatedToDate: Date;
  createdDate: Date;
  id: string;
  numberOfDays: number;
  numberOfShares: number;
  status: 'CALCULATING' | 'CALCULATED';
  totalDividendAmount: number;
  unitAmountPerSharePerDay: number;
}

export interface CalculatedDividendsTable {
  accountId: string;
  calculationDate: Date;
  declarationId: string;
  dividendAmount: number;
  feeAmount: number;
  id: string;
  profileId: string;
  sharesId: string;
  status: 'AWAITING_DISTRIBUTION' | 'DISTRIBUTED' | 'LOCKED' | 'REVOKED';
}

export interface DividendDistributionTable {
  distributeToDate: Date;
  id: string;
  status: 'DISTRIBUTING' | 'DISTRIBUTED';
}

export interface InvestorDividendsTable {
  accountId: string;
  actionDate: Date | null;
  calculatedDividends: JSONObject;
  createdDate: Date;
  distributionId: string;
  dividendAmount: number;
  id: string;
  profileId: string;
  status: 'AWAITING_ACTION' | 'REINVESTED' | 'WITHDRAWN' | 'ZEROED';
  totalDividendAmount: number;
  totalFeeAmount: number;
}

export interface UnpaidFeesTable {
  accountId: string;
  assignedDate: Date | null;
  assignedToDividendId: string | null;
  createdDate: Date;
  dividendId: string;
  feeToPay: number;
  id: string;
  profileId: string;
  status: 'AWAITING_ASSIGNMENT' | 'ASSIGNED';
}

export interface InvestorIncentiveDividendTable {
  accountId: string;
  actionDate: Date | null;
  amount: number;
  createdDate: Date;
  id: string;
  profileId: string;
  status: 'AWAITING_ACTION' | 'REINVESTED' | 'WITHDRAWN';
}

export interface FinancialOperationsTable {
  accountId: string;
  createdDate: Date;
  dataJson: JSONObject;
  id: string;
  operationType: 'INVESTMENT' | 'REINVESTMENT' | 'WITHDRAWAL' | 'REVOKED';
  profileId: string;
}

export interface GlobalFinancialOperationsTable {
  createdDate: Date;
  dataJson: JSONObject;
  id: string;
  operationType: 'NAV_CHANGED';
}
