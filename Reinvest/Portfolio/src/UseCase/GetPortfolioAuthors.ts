import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';

export class GetPortfolioAuthors {
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;

  constructor(portfolioUpdatesRepository: PortfolioAuthorsRepository) {
    this.portfolioAuthorsRepository = portfolioUpdatesRepository;
  }

  public static getClassName = (): string => 'GetPortfolioUpdates';

  public async execute() {
    const portfolioAuthors = await this.portfolioAuthorsRepository.getAll();
    const portfolioUpdatesData = [];

    if (!portfolioAuthors || portfolioAuthors.length === 0) {
      return [];
    }

    for (const update of portfolioAuthors) {
      const data = update.toObject();
      portfolioUpdatesData.push(data);
    }

    return portfolioUpdatesData;
  }
}
