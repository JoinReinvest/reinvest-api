export interface SharesServiceInterface {
  createShares(portfolioId: string, profileId: string, accountId: string, investmentId: string, amount: number): Promise<void>;

  fundingShares(investmentId: string, shares: number, unitSharePrice: number): Promise<void>;

  markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void>;

  sharesFunded(investmentId: string): Promise<void>;

  sharesSettled(investmentId: string): Promise<void>;
}
