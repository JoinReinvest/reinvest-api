import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { UUID } from 'HKEKTypes/Generics';
import {DeletePortfolioUpdate} from "Portfolio/UseCase/DeletePortfolioUpdate";
import {CreatePortfolioUpdate} from "Portfolio/UseCase/CreatePortfolioUpdate";
import {GetPortfolioUpdates} from "Portfolio/UseCase/GetPortfolioUpdates";

export class PortfolioUpdatesController {
  private portfolioUpdatesRepository: PortfolioUpdatesRepository;
  private deleteProfileUpdatesUseCase: DeletePortfolioUpdate;
  private createProfileUpdatesUseCase: CreatePortfolioUpdate;
  private getPortfolioUpdatesUseCase: GetPortfolioUpdates;

  constructor(portfolioUpdatesRepository: PortfolioUpdatesRepository, deleteProfileUpdatesUseCase: DeletePortfolioUpdate, createProfileUpdatesUseCase: CreatePortfolioUpdate, getPortfolioUpdatesUseCase: GetPortfolioUpdates) {
    this.portfolioUpdatesRepository = portfolioUpdatesRepository;
    this.deleteProfileUpdatesUseCase = deleteProfileUpdatesUseCase;
    this.createProfileUpdatesUseCase = createProfileUpdatesUseCase;
    this.getPortfolioUpdatesUseCase = getPortfolioUpdatesUseCase;
  }

  static getClassName = (): string => 'PortfolioUpdatesController';

  async delete(portfolioId: UUID) {
    return this.deleteProfileUpdatesUseCase.execute(portfolioId);
  }

  async add(portfolioId: UUID) {
    return this.createProfileUpdatesUseCase.execute(portfolioId);
  }

  async getAll() {
    return this.getPortfolioUpdatesUseCase.execute();
  }
}
