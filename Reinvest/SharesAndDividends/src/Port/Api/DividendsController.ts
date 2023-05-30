import { DividendDetails, DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';

export class DividendsController {
  private dividendsQuery: DividendsQuery;

  constructor(dividendsQuery: DividendsQuery) {
    this.dividendsQuery = dividendsQuery;
  }

  static getClassName = () => 'DividendsController';

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.dividendsQuery.getDividend(profileId, dividendId);
  }
}
