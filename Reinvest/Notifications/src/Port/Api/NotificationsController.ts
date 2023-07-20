import { UUID } from 'HKEKTypes/Generics';
import { Pagination } from 'Notifications/Application/Pagination';
import { CreateStoredEvent } from 'Notifications/Application/UseCase/CreateStoredEvent';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationFilter, NotificationQuery, NotificationsStats } from 'Notifications/Application/UseCase/NotificationQuery';
import { TransferNotification } from 'Notifications/Application/UseCase/TransferNotification';
import { NotificationView } from 'Notifications/Domain/Notification';
import { StoreEventCommand } from 'SimpleAggregator/EventBus/EventBus';

export class NotificationsController {
  private dismissNotificationsUseCase: DismissNotifications;
  private notificationQuery: NotificationQuery;
  private transferNotificationUseCase: TransferNotification;
  private createStoredEventUseCase: CreateStoredEvent;

  constructor(
    dismissNotificationsUseCase: DismissNotifications,
    notificationQuery: NotificationQuery,
    transferNotificationUseCase: TransferNotification,
    createStoredEventUseCase: CreateStoredEvent,
  ) {
    this.dismissNotificationsUseCase = dismissNotificationsUseCase;
    this.notificationQuery = notificationQuery;
    this.transferNotificationUseCase = transferNotificationUseCase;
    this.createStoredEventUseCase = createStoredEventUseCase;
  }

  static getClassName = () => 'NotificationsController';

  async createStoredEvent(storedEvent: StoreEventCommand): Promise<boolean> {
    try {
      const {
        data: { kind, payload, date },
        id: profileId,
      } = storedEvent;
      await this.createStoredEventUseCase.execute(profileId, kind, payload, date);

      return true;
    } catch (error: any) {
      console.error('[NotificationsController] createStoredEvent', error);

      return false;
    }
  }

  async dismissNotifications(profileId: string, dismissIds: string[]): Promise<boolean> {
    try {
      await this.dismissNotificationsUseCase.execute(profileId, dismissIds);

      return true;
    } catch (error: any) {
      console.error('[NotificationsController] dismissNotifications', error);

      return false;
    }
  }

  async getNotifications(
    profileId: string,
    accountId: string,
    notificationFilter: NotificationFilter,
    paginationInput: Pagination,
  ): Promise<NotificationView[]> {
    const pagination = !paginationInput.page || !paginationInput.perPage ? { page: 0, perPage: 10 } : paginationInput;

    return this.notificationQuery.getNotifications(profileId, accountId, notificationFilter, pagination);
  }

  async getNotificationsStats(profileId: string, accountId: string): Promise<NotificationsStats> {
    return this.notificationQuery.getNotificationsStats(profileId, accountId);
  }

  async transferNotificationToAccount(profileId: UUID, newAccountId: UUID, notificationUniqueId: UUID): Promise<void> {
    await this.transferNotificationUseCase.execute(profileId, newAccountId, notificationUniqueId);
  }
}
