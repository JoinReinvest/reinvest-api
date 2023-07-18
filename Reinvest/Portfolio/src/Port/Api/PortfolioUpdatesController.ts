import { UUID } from 'HKEKTypes/Generics';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { CreatePortfolioUpdate, PortfolioUpdateInput } from 'Portfolio/UseCase/CreatePortfolioUpdate';
import { DeletePortfolioUpdate } from 'Portfolio/UseCase/DeletePortfolioUpdate';
import { GetPortfolioUpdates } from 'Portfolio/UseCase/GetPortfolioUpdates';

export class PortfolioUpdatesController {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;
  private deleteProfileUpdatesUseCase: DeletePortfolioUpdate;
  private createProfileUpdatesUseCase: CreatePortfolioUpdate;
  private getPortfolioUpdatesUseCase: GetPortfolioUpdates;

  constructor(
    portfolioUpdatesRepository: PortfolioUpdatesRepository,
    deleteProfileUpdatesUseCase: DeletePortfolioUpdate,
    createProfileUpdatesUseCase: CreatePortfolioUpdate,
    getPortfolioUpdatesUseCase: GetPortfolioUpdates,
  ) {
    this.portfolioUpdatesRepository = portfolioUpdatesRepository;
    this.deleteProfileUpdatesUseCase = deleteProfileUpdatesUseCase;
    this.createProfileUpdatesUseCase = createProfileUpdatesUseCase;
    this.getPortfolioUpdatesUseCase = getPortfolioUpdatesUseCase;
  }

  static getClassName = (): string => 'PortfolioUpdatesController';

  async delete(id: UUID) {
    return this.deleteProfileUpdatesUseCase.execute(id);
  }

  async add(portfolioUpdateInput: PortfolioUpdateInput) {
    return this.createProfileUpdatesUseCase.execute(portfolioUpdateInput);
  }

  async getAll() {
    return this.getPortfolioUpdatesUseCase.execute();
  }
}
