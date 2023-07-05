import { UUID } from 'HKEKTypes/Generics';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { Pagination } from 'Notifications/Application/Pagination';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationFilter, NotificationQuery, NotificationsStats } from 'Notifications/Application/UseCase/NotificationQuery';
import { TransferNotification } from 'Notifications/Application/UseCase/TransferNotification';
import { NotificationObjectType, NotificationsType, NotificationView } from 'Notifications/Domain/Notification';

export class NotificationsController {
  private createNotificationUseCase: CreateNotification;
  private dismissNotificationsUseCase: DismissNotifications;
  private notificationQuery: NotificationQuery;
  private pushNotificationRepository: PushNotificationRepository;
  private transferNotificationUseCase: TransferNotification;

  constructor(
    createNotificationUseCase: CreateNotification,
    dismissNotificationsUseCase: DismissNotifications,
    notificationQuery: NotificationQuery,
    pushNotificationRepository: PushNotificationRepository,
    transferNotificationUseCase: TransferNotification,
  ) {
    this.createNotificationUseCase = createNotificationUseCase;
    this.dismissNotificationsUseCase = dismissNotificationsUseCase;
    this.notificationQuery = notificationQuery;
    this.pushNotificationRepository = pushNotificationRepository;
    this.transferNotificationUseCase = transferNotificationUseCase;
  }

  static getClassName = () => 'NotificationsController';

  async createNotification(
    profileId: string,
    accountId: string | null,
    notificationType: string,
    header: string,
    body: string,
    dismissId: string | null,
    onObjectId: string | null,
    onObjectType: NotificationObjectType | null,
    uniqueId: string | null,
    pushNotification?: { body: string; title: string },
  ): Promise<boolean> {
    try {
      if (!Object.keys(NotificationsType).includes(notificationType)) {
        throw new Error(`Invalid notification type: ${notificationType}`);
      }

      const doesNotificationAlreadyStored = uniqueId ? await this.notificationQuery.doesNotificationExists(uniqueId) : false;
      await this.createNotificationUseCase.execute({
        accountId,
        body,
        dismissId,
        header,
        notificationType: <NotificationsType>notificationType,
        onObjectId,
        onObjectType,
        profileId,
        uniqueId,
      });

      if (pushNotification && !doesNotificationAlreadyStored) {
        await this.pushNotificationRepository.pushNotification(profileId, pushNotification.title, pushNotification.body);
      }

      return true;
    } catch (error: any) {
      console.error('[NotificationsController] createNotification', error);

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
