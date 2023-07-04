import { JSONObject, JSONObjectOf, UUID } from 'HKEKTypes/Generics';
import { DividendDeclarationStatus, NumberOfSharesPerDay } from 'SharesAndDividends/Domain/CalculatingDividends/DividendDeclaration';
import { DividendDistributionStatus } from 'SharesAndDividends/Domain/CalculatingDividends/DividendDistribution';
import { IncentiveRewardStatus, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { CalculatedDividendsList, InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';
import { SharesOrigin, SharesStatus } from 'SharesAndDividends/Domain/Shares';
import { FinancialOperationType, GlobalFinancialOperationType } from 'SharesAndDividends/Domain/Stats/EVSDataPointsCalculatonService';

export interface SharesTable {
  accountId: string;
  dateCreated: Date;
  dateFunded: Date | null;
  dateFunding: Date | null;
  dateRevoked: Date | null;
  dateSettled: Date | null;
  id: string;
  numberOfShares: number | null;
  origin: SharesOrigin;
  originId: string;
  portfolioId: string;
  price: number;
  profileId: string;
  status: SharesStatus;
  transferredFrom: string | null;
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
  status: DividendDeclarationStatus;
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
  numberOfDaysInvestorOwnsShares: number;
  profileId: string;
  sharesId: string;
  status: 'AWAITING_DISTRIBUTION' | 'DISTRIBUTED' | 'LOCKED' | 'REVOKED';
}

export interface DividendDistributionTable {
  distributeToDate: Date;
  id: UUID;
  status: DividendDistributionStatus;
}

export interface InvestorDividendsTable {
  accountId: UUID;
  actionDate: Date | null;
  calculatedDividendsJson: JSONObjectOf<CalculatedDividendsList>;
  createdDate: Date;
  distributionId: UUID;
  dividendAmount: number;
  feesCoveredByDividendId: UUID | null;
  id: UUID;
  profileId: UUID;
  status: InvestorDividendStatus;
  totalDividendAmount: number;
  totalFeeAmount: number;
  transferredId: UUID | null;
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
