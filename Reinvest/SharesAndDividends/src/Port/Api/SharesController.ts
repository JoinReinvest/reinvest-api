import { Money } from 'Money/Money';
import { AccountState, AccountStateQuery } from 'SharesAndDividends/UseCase/AccountStateQuery';
import { ChangeSharesState, SharesChangeState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';

export class SharesController {
  private createSharesUseCase: CreateShares;
  private changeSharesStateUseCase: ChangeSharesState;
  private accountStateQuery: AccountStateQuery;

  constructor(createSharesUseCase: CreateShares, changeSharesStateUseCase: ChangeSharesState, accountStateQuery: AccountStateQuery) {
    this.createSharesUseCase = createSharesUseCase;
    this.changeSharesStateUseCase = changeSharesStateUseCase;
    this.accountStateQuery = accountStateQuery;
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

  async getAccountState(profileId: string, accountId: string): Promise<AccountState> {
    return this.accountStateQuery.getAccountState(profileId, accountId);
  }
}
