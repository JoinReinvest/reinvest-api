import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { AccountState, AccountStateQuery } from 'SharesAndDividends/UseCase/AccountStateQuery';
import { ChangeSharesState, SharesChangeState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { TransferredOrigins, TransferredShares, TransferShares } from 'SharesAndDividends/UseCase/TransferShares';
import { SharesOrigin } from 'SharesAndDividends/Domain/Shares';

export class SharesController {
  private createSharesUseCase: CreateShares;
  private changeSharesStateUseCase: ChangeSharesState;
  private accountStateQuery: AccountStateQuery;
  private transferSharesUseCase: TransferShares;

  constructor(
    createSharesUseCase: CreateShares,
    changeSharesStateUseCase: ChangeSharesState,
    accountStateQuery: AccountStateQuery,
    transferSharesUseCase: TransferShares,
  ) {
    this.createSharesUseCase = createSharesUseCase;
    this.changeSharesStateUseCase = changeSharesStateUseCase;
    this.accountStateQuery = accountStateQuery;
    this.transferSharesUseCase = transferSharesUseCase;
  }

  static getClassName = () => 'SharesController';

  async createShares(portfolioId: UUID, profileId: UUID, accountId: UUID, originId: UUID, amount: number, origin: SharesOrigin): Promise<void> {
    try {
      await this.createSharesUseCase.execute(portfolioId, profileId, accountId, originId, Money.lowPrecision(amount), origin);
    } catch (error: any) {
      console.error('[SharesController] createShares', { originId, accountId }, error);
    }
  }

  async setSharesToFundingState(originId: UUID, shares: number, unitSharePrice: number): Promise<void> {
    await this.changeSharesStateUseCase.execute(originId, SharesChangeState.FUNDING, {
      shares,
      unitPrice: unitSharePrice,
    });
  }

  async setSharesToFundedState(originId: UUID): Promise<void> {
    await this.changeSharesStateUseCase.execute(originId, SharesChangeState.FUNDED);
  }

  async setSharesToSettledState(originId: UUID): Promise<void> {
    await this.changeSharesStateUseCase.execute(originId, SharesChangeState.SETTLED);
  }

  async setSharesToRevokedState(originId: UUID): Promise<void> {
    await this.changeSharesStateUseCase.execute(originId, SharesChangeState.REVOKED);
  }

  async getAccountState(profileId: UUID, accountId: UUID): Promise<AccountState> {
    return this.accountStateQuery.getAccountState(profileId, accountId);
  }

  async transferShares(
    profileId: UUID,
    transferFromAccount: UUID,
    transferToAccount: UUID,
    transferredOrigins: TransferredOrigins[],
  ): Promise<TransferredShares[]> {
    return this.transferSharesUseCase.execute(profileId, transferFromAccount, transferToAccount, transferredOrigins);
  }
}
