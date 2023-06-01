import { Notifications } from 'Notifications/index';
import { IncentiveReward, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';

const sharesAndDividendsNotificationsTypes = {
  REWARD_DIVIDEND_RECEIVED: 'REWARD_DIVIDEND_RECEIVED',
};

const sharesAndDividendsNotifications = {
  [sharesAndDividendsNotificationsTypes.REWARD_DIVIDEND_RECEIVED]: {
    header: 'Referral Reward',
    bodyForInviter: (formattedAmount: string) => `You earned ${formattedAmount} for inviting a friends and family. Reinvest or withdraw your reward.`,
    bodyForInvitee: (formattedAmount: string) => `You earned ${formattedAmount}. Reinvest or withdraw your reward.`,
  },
};

export class NotificationService {
  private notificationsModule: Notifications.Main;

  constructor(notificationsModule: Notifications.Main) {
    this.notificationsModule = notificationsModule;
  }

  static getClassName = () => 'NotificationService';

  async createRewardDividendReceivedNotification(profileId: string, reward: IncentiveReward): Promise<void> {
    const api = this.notificationsModule.api();
    const { id: rewardId, amount, rewardType } = reward.getNotification();

    const type = sharesAndDividendsNotificationsTypes.REWARD_DIVIDEND_RECEIVED;
    const header = sharesAndDividendsNotifications[type]!.header;
    const body =
      rewardType === RewardType.INVITER
        ? sharesAndDividendsNotifications[type]!.bodyForInviter(amount)
        : sharesAndDividendsNotifications[type]!.bodyForInvitee(amount);

    await api.createNotification(profileId, null, type, header, body, rewardId, rewardId, 'DIVIDEND', rewardId);
  }
}
