export interface SharesServiceInterface {
  createShares(portfolioId: string, profileId: string, accountId: string, investmentId: string, amount: number): Promise<void>;
}
