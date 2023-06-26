import type { DividendDetails } from 'SharesAndDividends/Domain/types';
import { DividendsListQuery } from 'SharesAndDividends/UseCase/DividendsListQuery';
import { DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';
import { MarkDividendAsWithdrawn } from 'SharesAndDividends/UseCase/MarkDividendAsWithdrawn';

export class DividendsController {
  private dividendsQuery: DividendsQuery;
  private markDividendAsReinvestedUseCase: MarkDividendAsReinvested;
  private dividendsListQueryUseCase: DividendsListQuery;
  private markDividendAsWithdrewUseCase: MarkDividendAsWithdrawn;

  constructor(
    dividendsQuery: DividendsQuery,
    markDividendAsReinvestedUseCase: MarkDividendAsReinvested,
    dividendsListQueryUseCase: DividendsListQuery,
    markDividendAsWithdrewUseCase: MarkDividendAsWithdrawn,
  ) {
    this.dividendsQuery = dividendsQuery;
    this.markDividendAsReinvestedUseCase = markDividendAsReinvestedUseCase;
    this.dividendsListQueryUseCase = dividendsListQueryUseCase;
    this.markDividendAsWithdrewUseCase = markDividendAsWithdrewUseCase;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }

  async getDividendsList(profileId: string, accountId: string): Promise<DividendDetails[] | null> {
    return this.dividendsListQueryUseCase.getList(profileId, accountId);
  }

  async markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    await this.markDividendAsReinvestedUseCase.execute(profileId, accountId, dividendId);
  }

  async markDividendAsWithdrew(profileId: string, dividendId: string): Promise<void> {
    await this.markDividendAsWithdrewUseCase.execute(profileId, dividendId);
  }
}
