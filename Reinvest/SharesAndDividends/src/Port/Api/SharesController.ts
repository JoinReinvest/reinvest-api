import { Money } from 'Money/Money';
import { ChangeSharesState, SharesChangeState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';

export class SharesController {
  private createSharesUseCase: CreateShares;
  private changeSharesStateUseCase: ChangeSharesState;

  constructor(createSharesUseCase: CreateShares, changeSharesStateUseCase: ChangeSharesState) {
    this.createSharesUseCase = createSharesUseCase;
    this.changeSharesStateUseCase = changeSharesStateUseCase;
  }

  static getClassName = () => 'SharesController';

  async createShares(portfolioId: string, profileId: string, accountId: string, investmentId: string, amount: number): Promise<void> {
    try {
      await this.createSharesUseCase.execute(portfolioId, profileId, accountId, investmentId, Money.lowPrecision(amount));
    } catch (error: any) {
      console.error('[SharesController] createShares', { investmentId, accountId }, error);
    }
  }

  async setSharesToFundingState(investmentId: string, shares: number, unitSharePrice: number): Promise<void> {
    await this.changeSharesStateUseCase.execute(investmentId, SharesChangeState.FUNDING, {
      shares,
      unitPrice: unitSharePrice,
    });
  }

  async setSharesToFundedState(investmentId: string): Promise<void> {
    await this.changeSharesStateUseCase.execute(investmentId, SharesChangeState.FUNDED);
  }

  async setSharesToSettledState(investmentId: string): Promise<void> {
    await this.changeSharesStateUseCase.execute(investmentId, SharesChangeState.SETTLED);
  }
}
