import { FileInput } from 'LegalEntities/Domain/ValueObject/Document';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { PortfolioUpdate } from 'Portfolio/Domain/PortfolioUpdate';
import { ValidationErrorType } from 'Portfolio/Domain/Validation';
import * as console from "console";

export type PortfolioUpdateInput = {
  createdAt: Date;
  image: { id: string };
  title: string;
  body?: string;
};

export class CreatePortfolioUpdate {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;
  private portfolioRepository: PortfolioRepository;

  constructor(portfolioUpdatesRepository: PortfolioUpdatesRepository, portfolioRepository: PortfolioRepository) {
    this.portfolioUpdatesRepository = portfolioUpdatesRepository;
    this.portfolioRepository = portfolioRepository;
  }

  public static getClassName = (): string => 'CreatePortfolioUpdate';

  public async execute({ input }: PortfolioUpdateInput): Promise<ValidationErrorType[]> {
    const activePortfolio = await this.portfolioRepository.getActivePortfolio();
    const errors: ValidationErrorType[] = [];

    if (activePortfolio) {
      throw new Error('Active portfolio already exists');
    }

    // hard-coded for now to match the data on all environments
    const portfolioId = '34ccfe14-dc18-40df-a1d6-04f33b9fa7f4';
    console.log('input', input);
    const portfolioUpdate = PortfolioUpdate.create({ portfolioId, ...input });

    await this.portfolioUpdatesRepository.add(portfolioUpdate);

    return errors;
  }
}
