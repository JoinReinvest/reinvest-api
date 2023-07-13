import { UUID } from 'HKEKTypes/Generics';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioNorthCapitalAdapter } from 'Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter';
import { PortfolioVertaloAdapter } from 'Portfolio/Adapter/Vertalo/PortfolioVertaloAdapter';

export class RegisterPortfolio {
  public static getClassName = (): string => 'RegisterPortfolio';
  private portfolioRepository: PortfolioRepository;
  private vertaloAdapter: PortfolioVertaloAdapter;
  private northCapitalAdapter: PortfolioNorthCapitalAdapter;

  constructor(portfolioRepository: PortfolioRepository, northCapitalAdapter: PortfolioNorthCapitalAdapter, vertaloAdapter: PortfolioVertaloAdapter) {
    this.portfolioRepository = portfolioRepository;
    this.northCapitalAdapter = northCapitalAdapter;
    this.vertaloAdapter = vertaloAdapter;
  }

  async execute(name: string, northCapitalOfferingId: string, vertaloAllocationId: string, linkToOfferingCircular: string): Promise<UUID | never> {
    const activePortfolio = await this.portfolioRepository.getActivePortfolio();

    if (activePortfolio) {
      throw new Error('Active portfolio already exists');
    }

    // hard-coded for now to match the data on all environments
    const portfolioId = '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4';
    const assetName = ''; // TODO call vertalo
    const offeringName = ''; // TODO call north capital\
    // todo first sync of nav from NC

    return portfolioId;
  }
}
