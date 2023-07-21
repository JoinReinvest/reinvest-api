import { Notifications } from 'Notifications/index';
import { IncentiveReward } from 'SharesAndDividends/Domain/IncentiveReward';
import { InvestorDividend } from 'SharesAndDividends/Domain/InvestorDividend';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class NotificationService {
  private notificationsModule: Notifications.Main;

  constructor(notificationsModule: Notifications.Main) {
    this.notificationsModule = notificationsModule;
  }

  static getClassName = () => 'NotificationService';

  async createRewardDividendReceivedNotification(profileId: string, reward: IncentiveReward): Promise<void> {
    const api = this.notificationsModule.api();
    const { id: rewardId, amount, rewardType } = reward.getNotification();

    const command = storeEventCommand(profileId, 'ReferralRewardReceived', {
      uniqueId: rewardId,
      dismissId: rewardId,
      rewardId: rewardId,
      rewardFor: rewardType,
      amount: amount,
    });

    await api.createStoredEvent(command);
  }

  async notifyDividendUpdate(investorDividend: InvestorDividend): Promise<void> {
    const api = this.notificationsModule.api();
    const { profileId, accountId, dividendId, dividendAmount } = investorDividend.getNotification();

    const command = storeEventCommand(profileId, 'DividendReceived', {
      accountId,
      uniqueId: dividendId,
      dismissId: dividendId,
      dividendId,
      amount: dividendAmount,
    });

    await api.createStoredEvent(command);
  }

  async transferDividendNotificationToAccount(profileId: string, newAccountId: string, dividendId: string): Promise<void> {
    const api = this.notificationsModule.api();
    await api.transferNotificationToAccount(profileId, newAccountId, dividendId);
  }

  async markNotificationAsRead(profileId: string, dismissId: string): Promise<void> {
    const api = this.notificationsModule.api();
    await api.dismissNotifications(profileId, [dismissId]);
  }
}
