import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';
import { Pagination } from 'Notifications/Application/Pagination';
import { Notification, NotificationView } from 'Notifications/Domain/Notification';

export enum NotificationFilter {
  UNREAD = 'UNREAD',
  ALL = 'ALL',
}

export class NotificationQuery {
  private notificationsRepository: NotificationsRepository;

  constructor(notificationsRepository: NotificationsRepository) {
    this.notificationsRepository = notificationsRepository;
  }

  static getClassName = () => 'NotificationQuery';

  async getNotifications(profileId: string, accountId: string, notificationFilter: NotificationFilter, pagination: Pagination): Promise<NotificationView[]> {
    const notifications =
      notificationFilter === 'UNREAD'
        ? await this.notificationsRepository.findUnreadNotifications(profileId, accountId, pagination)
        : await this.notificationsRepository.findAllNotifications(profileId, accountId, pagination);

    return notifications.map((notification: Notification) => notification.getView());
  }
}
