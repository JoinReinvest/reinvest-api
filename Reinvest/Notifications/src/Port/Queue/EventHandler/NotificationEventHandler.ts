import { UUID } from 'HKEKTypes/Generics';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationQuery } from 'Notifications/Application/UseCase/NotificationQuery';
import { NotificationObjectType, NotificationsType } from 'Notifications/Domain/Notification';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export type DismissNotificationCommand = DomainEvent & {
  data: {
    dismissId: UUID;
    profileId: UUID;
  };
  kind: 'DismissNotification';
};

export type CreateNotificationCommand = DomainEvent & {
  data: {
    accountId: UUID | null;
    body: string;
    dismissId: UUID | null;
    header: string;
    notificationType: NotificationsType;
    onObjectId: UUID | null;
    onObjectType: NotificationObjectType | null;
    profileId: UUID;
    uniqueId: UUID | null;
    pushNotification?: {
      body: string;
      title: string;
    };
  };
  kind: 'CreateNotification';
};

export class NotificationEventHandler implements EventHandler<DomainEvent> {
  private createNotificationUseCase: CreateNotification;
  private dismissNotificationsUseCase: DismissNotifications;
  private pushNotificationRepository: PushNotificationRepository;
  private notificationQuery: NotificationQuery;

  constructor(
    createNotificationUseCase: CreateNotification,
    dismissNotificationsUseCase: DismissNotifications,
    pushNotificationRepository: PushNotificationRepository,
    notificationQuery: NotificationQuery,
  ) {
    this.createNotificationUseCase = createNotificationUseCase;
    this.dismissNotificationsUseCase = dismissNotificationsUseCase;
    this.pushNotificationRepository = pushNotificationRepository;
    this.notificationQuery = notificationQuery;
  }

  static getClassName = (): string => 'NotificationEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (event.kind === 'CreateNotification') {
      return this.createNotification(<CreateNotificationCommand>event);
    }

    if (event.kind === 'DismissNotification') {
      return this.dismissNotification(<DismissNotificationCommand>event);
    }
  }

  private async createNotification(event: CreateNotificationCommand): Promise<void> {
    try {
      const { notificationType, accountId, body, dismissId, header, onObjectId, onObjectType, profileId, uniqueId, pushNotification } = event.data;

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
    } catch (error: any) {
      console.error('[NotificationEventHandler] createStoredEvent', error);
    }
  }

  private async dismissNotification(event: DismissNotificationCommand): Promise<void> {
    try {
      const { profileId, dismissId } = event.data;
      await this.dismissNotificationsUseCase.execute(profileId, [dismissId]);
    } catch (error: any) {
      console.error('[NotificationEventHandler] dismissNotification', error);
    }
  }
}
