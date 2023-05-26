/**
 * Returns mock data for the active portfolio
 */
export class PortfolioController {
  static getClassName = (): string => 'PortfolioController';

  async getActivePortfolio(): Promise<{ portfolioId: string; portfolioName: string }> {
    return { portfolioId: '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4', portfolioName: 'Community REIT' };
  }

  async getPortfolio(portfolioId: string): Promise<{ portfolioId: string; portfolioName: string }> {
    return this.getActivePortfolio();
  }

  async getPortfolioVendorsConfiguration(portfolioId: string): Promise<{
    ncOfferingId: string;
    vertaloAllocationId: string;
  }> {
    return {
      ncOfferingId: '1290029',
      vertaloAllocationId: '6a03167e-28d1-4378-b881-a5ade307b81b',
    };
  }

  async getCurrentNav(portfolioId: string): Promise<{ unitSharePrice: number }> {
    return {
      unitSharePrice: 104,
    };
  }
}
