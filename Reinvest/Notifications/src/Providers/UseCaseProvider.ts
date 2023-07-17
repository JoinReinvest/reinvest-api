import { ContainerInterface } from 'Container/Container';
import { IdentityService } from 'Identity/Adapter/Module/IdentityService';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { EmailSender } from 'Notifications/Adapter/SES/EmailSender';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationQuery } from 'Notifications/Application/UseCase/NotificationQuery';
import { ProcessStoredEvent } from 'Notifications/Application/UseCase/ProcessStoredEvent';
import { TransferNotification } from 'Notifications/Application/UseCase/TransferNotification';
import { Notifications } from 'Notifications/index';

export class UseCaseProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateNotification, [NotificationsRepository, IdGenerator]);
    container.addSingleton(TransferNotification, [NotificationsRepository]);
    container.addSingleton(DismissNotifications, [NotificationsRepository]);
    container.addSingleton(NotificationQuery, [NotificationsRepository]);
    container.addSingleton(ProcessStoredEvent, [
      StoredEventRepository,
      AccountActivitiesRepository,
      CreateNotification,
      PushNotificationRepository,
      IdentityService,
      EmailSender,
    ]);
  }
}
