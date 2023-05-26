import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';

export class SharesController {
  private createSharesUseCase: CreateShares;

  constructor(createSharesUseCase: CreateShares) {
    this.createSharesUseCase = createSharesUseCase;
  }

  static getClassName = () => 'SharesController';

  async createShares(portfolioId: string, profileId: string, accountId: string, investmentId: string, amount: number): Promise<void> {
    await this.createSharesUseCase.execute(portfolioId, profileId, accountId, investmentId, amount);
  }
}
