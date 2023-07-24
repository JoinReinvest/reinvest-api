import { UUID } from 'HKEKTypes/Generics';
import type { DividendDetails } from 'SharesAndDividends/Domain/types';
import { DividendsListQuery } from 'SharesAndDividends/UseCase/DividendsListQuery';
import { AutoReinvestDividend, DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { DividendWithdrawing } from 'SharesAndDividends/UseCase/DividendWithdrawing';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';
import { MarkDividendAsWithdrawn } from 'SharesAndDividends/UseCase/MarkDividendAsWithdrawn';
import { TransferDividends, TransferredDividends } from 'SharesAndDividends/UseCase/TransferDividends';

export class DividendsController {
  private dividendsQuery: DividendsQuery;
  private markDividendAsReinvestedUseCase: MarkDividendAsReinvested;
  private dividendsListQueryUseCase: DividendsListQuery;
  private markDividendAsWithdrewUseCase: MarkDividendAsWithdrawn;
  private transferDividendsUseCase: TransferDividends;
  private dividendWithdrawing: DividendWithdrawing;

  constructor(
    dividendsQuery: DividendsQuery,
    markDividendAsReinvestedUseCase: MarkDividendAsReinvested,
    dividendsListQueryUseCase: DividendsListQuery,
    markDividendAsWithdrewUseCase: MarkDividendAsWithdrawn,
    transferDividendsUseCase: TransferDividends,
    dividendWithdrawing: DividendWithdrawing,
  ) {
    this.dividendsQuery = dividendsQuery;
    this.markDividendAsReinvestedUseCase = markDividendAsReinvestedUseCase;
    this.dividendsListQueryUseCase = dividendsListQueryUseCase;
    this.markDividendAsWithdrewUseCase = markDividendAsWithdrewUseCase;
    this.transferDividendsUseCase = transferDividendsUseCase;
    this.dividendWithdrawing = dividendWithdrawing;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }

  async getDividendsList(profileId: string, accountId: string): Promise<DividendDetails[]> {
    return this.dividendsListQueryUseCase.getList(profileId, accountId);
  }

  async markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    await this.markDividendAsReinvestedUseCase.execute(profileId, accountId, dividendId);
  }

  async markDividendAsWithdrew(profileId: string, dividendId: string): Promise<void> {
    await this.markDividendAsWithdrewUseCase.execute(profileId, dividendId);
  }

  async markDividendAsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    return this.dividendWithdrawing.markAsWithdrawing(dividendsIds);
  }

  async abortDividendsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    return this.dividendWithdrawing.abortWithdrawing(dividendsIds);
  }

  async completeDividendsWithdrawing(dividendsIds: UUID[]): Promise<void> {
    return this.dividendWithdrawing.completeWithdrawing(dividendsIds);
  }

  async transferDividends(profileId: UUID, transferFromAccount: UUID, transferToAccount: UUID): Promise<TransferredDividends[]> {
    return this.transferDividendsUseCase.execute(profileId, transferFromAccount, transferToAccount);
  }

  async getDividendsReadyForAutomaticReinvestment(): Promise<AutoReinvestDividend[]> {
    return this.dividendsQuery.getDividendsReadyForAutomaticReinvestment();
  }
}
