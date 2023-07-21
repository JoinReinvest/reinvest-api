import { UUID } from 'HKEKTypes/Generics';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';

export class TransferNotification {
  private notificationsRepository: NotificationsRepository;

  constructor(notificationsRepository: NotificationsRepository) {
    this.notificationsRepository = notificationsRepository;
  }

  static getClassName = () => 'TransferNotification';

  async execute(profileId: UUID, accountId: UUID, notificationUniqueId: UUID): Promise<void> {
    const notification = await this.notificationsRepository.getNotificationByUniqueId(profileId, notificationUniqueId);

    if (!notification) {
      return;
    }

    notification.transferToAccount(accountId);
    await this.notificationsRepository.transferNotification(notification);
  }
}
