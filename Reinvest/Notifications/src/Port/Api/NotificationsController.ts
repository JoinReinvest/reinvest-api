import { NotificationsType } from 'Notifications/Domain/Notification';
import { CreateNotification } from 'Notifications/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/UseCase/DismissNotifications';

export class NotificationsController {
  private createNotificationUseCase: CreateNotification;
  private dismissNotificationsUseCase: DismissNotifications;

  constructor(createNotificationUseCase: CreateNotification, dismissNotificationsUseCase: DismissNotifications) {
    this.createNotificationUseCase = createNotificationUseCase;
    this.dismissNotificationsUseCase = dismissNotificationsUseCase;
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
    onObjectType: string | null,
    uniqueId: string | null,
  ): Promise<boolean> {
    try {
      if (!Object.keys(NotificationsType).includes(notificationType)) {
        throw new Error(`Invalid notification type: ${notificationType}`);
      }

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
}
