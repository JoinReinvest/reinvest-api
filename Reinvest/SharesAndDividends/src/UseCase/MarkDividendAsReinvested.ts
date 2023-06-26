import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { IncentiveRewardStatus } from 'SharesAndDividends/Domain/IncentiveReward';
import { InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';

export class MarkDividendAsReinvested {
  private dividendsRepository: DividendsRepository;
  private notificationService: NotificationService;

  constructor(dividendsRepository: DividendsRepository, notificationService: NotificationService) {
    this.dividendsRepository = dividendsRepository;
    this.notificationService = notificationService;
  }

  static getClassName = () => 'MarkDividendAsReinvested';

  async execute(profileId: string, accountId: string, dividendId: string): Promise<void> {
    const dividend = await this.dividendsRepository.findDividend(profileId, dividendId);

    if (!dividend) {
      throw new Error(`Dividend ${dividendId} not found`);
    }

    if (dividend.type === 'REWARD') {
      await this.dividendsRepository.markIncentiveDividendAs(IncentiveRewardStatus.REINVESTED, profileId, dividendId, accountId);
    } else {
      await this.dividendsRepository.markDividendAs(InvestorDividendStatus.REINVESTED, profileId, dividendId);
    }

    await this.notificationService.markNotificationAsRead(profileId, dividendId);
  }
}
