import dayjs from 'dayjs';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { AccountStats, AccountStatsView } from 'SharesAndDividends/Domain/AccountStats';
import { AccountStatsCalculationService, SharesAndTheirPrices } from 'SharesAndDividends/Domain/AccountStatsCalculationService';
import { DividendsCalculationService } from 'SharesAndDividends/Domain/DividendsCalculationService';
import { EVSChartResolution, EVSDataPointsCalculationService } from 'SharesAndDividends/Domain/EVSDataPointsCalculatonService';

export class StatsQuery {
  private sharesRepository: SharesRepository;
  private portfolioService: PortfolioService;
  private dividendsRepository: DividendsRepository;
  private financialOperationsRepository: FinancialOperationsRepository;

  constructor(
    sharesRepository: SharesRepository,
    portfolioService: PortfolioService,
    dividendsRepository: DividendsRepository,
    financialOperationsRepository: FinancialOperationsRepository,
  ) {
    this.sharesRepository = sharesRepository;
    this.portfolioService = portfolioService;
    this.dividendsRepository = dividendsRepository;
    this.financialOperationsRepository = financialOperationsRepository;
  }

  static getClassName = () => 'StatsQuery';

  async calculateAccountStatus(profileId: string, accountId: string): Promise<AccountStatsView> {
    const sharesPerPortfolio = await this.sharesRepository.getNotRevokedSharesAndTheirPrice(profileId, accountId);
    const unpaidDividendsAndFees = await this.dividendsRepository.getUnpaidDividendsAndFees(profileId, accountId);

    let totalAccountStats = new AccountStats();

    for (const portfolioId in sharesPerPortfolio) {
      const currentNav = await this.portfolioService.getCurrentNav(portfolioId);
      const sharesAndTheirPrices = <SharesAndTheirPrices[]>sharesPerPortfolio[portfolioId];
      const accountStatsCalculationService = new AccountStatsCalculationService(currentNav, sharesAndTheirPrices);
      totalAccountStats = totalAccountStats.sum(accountStatsCalculationService.calculateAccountStats());
    }

    totalAccountStats = DividendsCalculationService.updateAccountStatsForDividendsAndFees(totalAccountStats, unpaidDividendsAndFees);

    return totalAccountStats.calculateAccountValue().calculateAppreciation().calculateNetReturns().getAccountStatsView();
  }

  /**
   *     type EVSChartPoint {
   *         usd: Float!
   *         date: ISODate!
   *     }
   *
   *     type EVSChart {
   *         resolution: EVSChartResolution
   *         startAt: ISODate!
   *         endAt: ISODate!
   *         changeFactor: String!
   *         dataPoints: [EVSChartPoint]
   *     }
   */
  async getEVSChart(profileId: string, accountId: string, resolution: EVSChartResolution): Promise<any> {
    const financialOperationRecords = await this.financialOperationsRepository.getFinancialOperationsForAccount(profileId, accountId);
    const dataPoints = EVSDataPointsCalculationService.calculateEVSDataPoints(resolution, financialOperationRecords);

    return {
      resolution,
      startAt: dataPoints[0] ? dataPoints[0].date : dayjs().format('YYYY-MM-DD'),
      // @ts-ignore
      endAt: dataPoints[dataPoints.length - 1] ? dataPoints[dataPoints.length - 1].date : dayjs().format('YYYY-MM-DD'),
      changeFactor: EVSDataPointsCalculationService.calculateChangeFactor(dataPoints),
      dataPoints,
    };
  }
}
