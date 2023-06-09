import { DividendDetails, DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';

export class DividendsController {
  private dividendsQuery: DividendsQuery;
  private markDividendAsReinvestedUseCase: MarkDividendAsReinvested;

  constructor(dividendsQuery: DividendsQuery, markDividendAsReinvestedUseCase: MarkDividendAsReinvested) {
    this.dividendsQuery = dividendsQuery;
    this.markDividendAsReinvestedUseCase = markDividendAsReinvestedUseCase;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }

  async markDividendReinvested(profileId: string, accountId: string, dividendId: string): Promise<void> {
    await this.markDividendAsReinvestedUseCase.execute(profileId, accountId, dividendId);
  }
}
