import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';

export class StatsController {
  private statsQuery: StatsQuery;

  constructor(statsQuery: StatsQuery) {
    this.statsQuery = statsQuery;
  }

  static getClassName = () => 'StatsController';

  async getAccountStats(profileId: string, accountId: string): Promise<any> {
    return this.statsQuery.calculateAccountStatus(profileId, accountId);
  }
}
