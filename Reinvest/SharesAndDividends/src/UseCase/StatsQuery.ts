import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { AccountStats, AccountStatsView } from 'SharesAndDividends/Domain/AccountStats';
import { AccountStatsCalculationService, SharesAndTheirPrices } from 'SharesAndDividends/Domain/AccountStatsCalculationService';
import { DividendsCalculationService } from 'SharesAndDividends/Domain/DividendsCalculationService';

export class StatsQuery {
  private sharesRepository: SharesRepository;
  private portfolioService: PortfolioService;
  private dividendsRepository: DividendsRepository;

  constructor(sharesRepository: SharesRepository, portfolioService: PortfolioService, dividendsRepository: DividendsRepository) {
    this.sharesRepository = sharesRepository;
    this.portfolioService = portfolioService;
    this.dividendsRepository = dividendsRepository;
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
}
