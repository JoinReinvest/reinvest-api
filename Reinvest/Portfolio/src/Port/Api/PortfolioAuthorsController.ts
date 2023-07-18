import { AddPortfolioAuthor, PortfolioAuthorInput } from 'Portfolio/UseCase/AddPortfolioAuthor';
import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { UUID } from 'HKEKTypes/Generics';
import { DeletePortfolioAuthor } from 'Portfolio/UseCase/DeletePortfolioAuthor';
import { GetPortfolioAuthors } from 'Portfolio/UseCase/GetPortfolioAuthors';

export class PortfolioAuthorsController {
  private portfolioAuthorsRepository: PortfolioAuthorsRepository;
  private addPortfolioAuthorUseCase: AddPortfolioAuthor;
  private deletePortfolioAuthorUseCase: DeletePortfolioAuthor;
  private getPortfolioAuthorsUseCase: GetPortfolioAuthors;

  constructor(
    portfolioAuthorsRepository: PortfolioAuthorsRepository,
    addPortfolioAuthorUseCase: AddPortfolioAuthor,
    deletePortfolioAuthorUseCase: DeletePortfolioAuthor,
    getPortfolioAuthorsUseCase: GetPortfolioAuthors,
  ) {
    this.portfolioAuthorsRepository = portfolioAuthorsRepository;
    this.addPortfolioAuthorUseCase = addPortfolioAuthorUseCase;
    this.deletePortfolioAuthorUseCase = deletePortfolioAuthorUseCase;
    this.getPortfolioAuthorsUseCase = getPortfolioAuthorsUseCase;
  }

  static getClassName = (): string => 'PortfolioAuthorsController';

  async add(portfolioAuthorInput: PortfolioAuthorInput) {
    return this.addPortfolioAuthorUseCase.execute(portfolioAuthorInput);
  }

  async delete(id: UUID) {
    return this.deletePortfolioAuthorUseCase.execute(id);
  }

  async getAll() {
    return this.getPortfolioAuthorsUseCase.execute();
  }
}
