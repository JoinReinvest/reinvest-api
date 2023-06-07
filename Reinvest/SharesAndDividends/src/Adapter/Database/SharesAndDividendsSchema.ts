import { JSONObject, JSONObjectOf } from 'HKEKTypes/Generics';
import { NumberOfSharesPerDay } from 'SharesAndDividends/Domain/Dividends/DividendDeclaration';
import { FinancialOperationType, GlobalFinancialOperationType } from 'SharesAndDividends/Domain/EVSDataPointsCalculatonService';
import { IncentiveRewardStatus, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { SharesStatus } from 'SharesAndDividends/Domain/Shares';

export interface SharesTable {
  accountId: string;
  dateCreated: Date;
  dateFunded: Date | null;
  dateRevoked: Date | null;
  dateSettled: Date | null;
  id: string;
  investmentId: string;
  numberOfShares: number | null;
  portfolioId: string;
  price: number;
  profileId: string;
  status: SharesStatus;
  unitPrice: number | null;
}

export type SharesAndTheirPricesSelection = Pick<SharesTable, 'numberOfShares' | 'price' | 'unitPrice' | 'portfolioId'>;

export interface DividendsDeclarationTable {
  calculatedFromDate: Date;
  calculatedToDate: Date;
  calculationFinishedDate: Date | null;
  createdDate: Date;
  id: string;
  numberOfDays: number;
  numberOfSharesJson: JSONObjectOf<NumberOfSharesPerDay>;
  portfolioId: string;
  status: 'CALCULATING' | 'CALCULATED';
  totalDividendAmount: number;
  unitAmountPerDay: number;
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
  status: 'AWAITING_ACTION' | 'REINVESTED' | 'WITHDRAWN' | 'ZEROED' | 'WITHDRAWING';
  totalDividendAmount: number;
  totalFeeAmount: number;
}

export type DividendsSelection = Pick<InvestorDividendsTable, 'totalDividendAmount' | 'totalFeeAmount'>;

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
  accountId: string | null;
  actionDate: Date | null;
  amount: number;
  createdDate: Date;
  id: string;
  profileId: string;
  rewardType: RewardType;
  status: IncentiveRewardStatus;
  theOtherProfileId: string;
}

export interface FinancialOperationsTable {
  accountId: string;
  createdDate: Date;
  dataJson: JSONObject;
  id: string;
  operationType: FinancialOperationType;
  profileId: string;
}

export interface GlobalFinancialOperationsTable {
  createdDate: Date;
  dataJson: JSONObject;
  id: string;
  operationType: GlobalFinancialOperationType;
}
