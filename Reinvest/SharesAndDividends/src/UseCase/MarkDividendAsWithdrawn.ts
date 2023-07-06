import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';
import { IncentiveRewardStatus } from 'SharesAndDividends/Domain/IncentiveReward';
import { InvestorDividendStatus } from 'SharesAndDividends/Domain/InvestorDividend';

export class MarkDividendAsWithdrawn {
  private dividendsRepository: DividendsRepository;
  private notificationService: NotificationService;

  constructor(dividendsRepository: DividendsRepository, notificationService: NotificationService) {
    this.dividendsRepository = dividendsRepository;
    this.notificationService = notificationService;
  }

  static getClassName = () => 'MarkDividendAsWithdrawn';

  async execute(profileId: string, dividendId: string): Promise<void> {
    const dividend = await this.dividendsRepository.findDividend(profileId, dividendId);

    if (!dividend) {
      throw new Error(`Dividend ${dividendId} not found`);
    }

    if (dividend.type === 'REWARD') {
      await this.dividendsRepository.markIncentiveDividendAs(IncentiveRewardStatus.WITHDRAWN, profileId, dividendId);
    } else {
      await this.dividendsRepository.markDividendAs(InvestorDividendStatus.WITHDRAWN, profileId, dividendId);
    }

    await this.notificationService.markNotificationAsRead(profileId, dividendId);
  }
}
