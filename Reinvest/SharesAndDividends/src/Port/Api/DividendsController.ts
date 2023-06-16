import type { DividendDetails } from 'SharesAndDividends/Domain/types';
import { DividendsListQuery } from 'SharesAndDividends/UseCase/DividendsListQuery';
import { DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';

export class DividendsController {
  private dividendsQuery: DividendsQuery;
  private markDividendAsReinvestedUseCase: MarkDividendAsReinvested;
  private dividendsListQueryUseCase: DividendsListQuery;

  constructor(dividendsQuery: DividendsQuery, markDividendAsReinvestedUseCase: MarkDividendAsReinvested, dividendsListQueryUseCase: DividendsListQuery) {
    this.dividendsQuery = dividendsQuery;
    this.markDividendAsReinvestedUseCase = markDividendAsReinvestedUseCase;
    this.dividendsListQueryUseCase = dividendsListQueryUseCase;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }

  async getDividendsList(profileId: string, accountId: string): Promise<DividendDetails[] | null> {
    return await this.dividendsListQueryUseCase.getList(profileId, accountId);
  }

  async markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    await this.markDividendAsReinvestedUseCase.execute(profileId, accountId, dividendId);
  }
}
