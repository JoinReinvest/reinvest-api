import { AccountStatsView } from 'SharesAndDividends/Domain/AccountStats';
import { EVSChartResolution } from 'SharesAndDividends/Domain/EVSDataPointsCalculatonService';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';

export class StatsController {
  private statsQuery: StatsQuery;

  constructor(statsQuery: StatsQuery) {
    this.statsQuery = statsQuery;
  }

  static getClassName = () => 'StatsController';

  async getAccountStats(profileId: string, accountId: string): Promise<AccountStatsView> {
    return this.statsQuery.calculateAccountStatus(profileId, accountId);
  }

  async getEVSChart(profileId: string, accountId: string, resolution: EVSChartResolution): Promise<any> {
    return this.statsQuery.getEVSChart(profileId, accountId, resolution);
  }
}
