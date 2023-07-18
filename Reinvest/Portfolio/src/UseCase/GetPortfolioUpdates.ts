import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';

export class GetPortfolioUpdates {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;

  constructor(portfolioUpdatesRepository: PortfolioUpdatesRepository) {
    this.portfolioUpdatesRepository = portfolioUpdatesRepository;
  }

  public static getClassName = (): string => 'GetPortfolioUpdates';

  public async execute() {
    const portfolioUpdates = await this.portfolioUpdatesRepository.getAll();
    const portfolioUpdatesData = [];

    if (!portfolioUpdates || portfolioUpdates.length === 0) {
      return [];
    }

    for (const update of portfolioUpdates) {
      const data = update.toObject();
      portfolioUpdatesData.push(data);
    }

    return portfolioUpdatesData;
  }
}
