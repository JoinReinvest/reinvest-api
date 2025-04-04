export interface SharesServiceInterface {
  createShares(
    portfolioId: string,
    profileId: string,
    accountId: string,
    investmentId: string,
    amount: number,
    origin: 'INVESTMENT' | 'DIVIDEND',
  ): Promise<void>;

  fundingShares(investmentId: string, shares: number, unitSharePrice: number): Promise<void>;

  markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void>;

  sharesFunded(investmentId: string): Promise<void>;

  sharesRevoked(investmentId: string): Promise<void>;

  sharesSettled(investmentId: string): Promise<void>;
}
