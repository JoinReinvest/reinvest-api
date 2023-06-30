import { Notifications } from 'Notifications/index';
import { IncentiveReward, RewardType } from 'SharesAndDividends/Domain/IncentiveReward';
import { InvestorDividend } from 'SharesAndDividends/Domain/InvestorDividend';
import { NotificationObjectType } from 'Notifications/Domain/Notification';

const sharesAndDividendsNotificationsTypes = {
  REWARD_DIVIDEND_RECEIVED: 'REWARD_DIVIDEND_RECEIVED',
  DIVIDEND_RECEIVED: 'DIVIDEND_RECEIVED',
};

const sharesAndDividendsNotifications = {
  [sharesAndDividendsNotificationsTypes.REWARD_DIVIDEND_RECEIVED]: {
    header: 'Referral Reward',
    bodyForInviter: (formattedAmount: string) => `You earned ${formattedAmount} for inviting a friends and family. Reinvest or withdraw your reward.`,
    bodyForInvitee: (formattedAmount: string) => `You earned ${formattedAmount}. Reinvest or withdraw your reward.`,
  },
  [sharesAndDividendsNotificationsTypes.DIVIDEND_RECEIVED]: {
    header: 'Dividend Update',
    body: (formattedAmount: string) => `You earned ${formattedAmount} in dividends. Reinvest or withdraw your dividend.`,
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
    const message = sharesAndDividendsNotifications[type]!;
    const header = message.header;
    // @ts-ignore
    const body = rewardType === RewardType.INVITER ? message.bodyForInviter(amount) : message.bodyForInvitee(amount);
    const pushNotification = {
      title: header,
      body,
    };

    await api.createNotification(profileId, null, type, header, body, rewardId, rewardId, NotificationObjectType.DIVIDEND, rewardId, pushNotification);
  }

  async notifyDividendUpdate(investorDividend: InvestorDividend): Promise<void> {
    const api = this.notificationsModule.api();
    const { profileId, accountId, dividendId, dividendAmount } = investorDividend.getNotification();

    const type = sharesAndDividendsNotificationsTypes.DIVIDEND_RECEIVED;
    const message = sharesAndDividendsNotifications[type]!;
    const header = message.header;
    // @ts-ignore
    const body = message.body(dividendAmount);

    await api.createNotification(profileId, accountId, type, header, body, dividendId, dividendId, 'DIVIDEND', dividendId);
  }

  async markNotificationAsRead(profileId: string, dismissId: string): Promise<void> {
    const api = this.notificationsModule.api();
    await api.dismissNotifications(profileId, [dismissId]);
  }
}
