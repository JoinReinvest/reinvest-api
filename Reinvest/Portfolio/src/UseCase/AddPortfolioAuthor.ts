import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { ValidationErrorType } from 'Portfolio/Domain/Validation';
import {PortfolioAuthor} from "Portfolio/Domain/PortfolioAuthor";

export type PortfolioAuthorInput = {
    avatar: { id: string };
    name: string;
};

export class AddPortfolioAuthor {
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;
  private idGenerator: IdGeneratorInterface;
  private portfolioRepository: PortfolioRepository;

  constructor(portfolioUpdatesRepository: PortfolioAuthorsRepository, portfolioRepository: PortfolioRepository, idGenerator: IdGeneratorInterface) {
    this.portfolioAuthorsRepository = portfolioUpdatesRepository;
    this.portfolioRepository = portfolioRepository;
    this.idGenerator = idGenerator;
  }

  public static getClassName = (): string => 'AddPortfolioAuthor';

  public async execute(input: PortfolioAuthorInput): Promise<ValidationErrorType[]> {
    const errors: ValidationErrorType[] = [];

    const portfolioAuthorId = this.idGenerator.createUuid();
    const portfolioAuthor = PortfolioAuthor.create({ id: portfolioAuthorId, ...input });

    await this.portfolioAuthorsRepository.add(portfolioAuthor);

    return errors;
  }
}
