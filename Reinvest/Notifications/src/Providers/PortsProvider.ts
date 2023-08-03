import { ContainerInterface } from 'Container/Container';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationQuery } from 'Notifications/Application/UseCase/NotificationQuery';
import { ProcessStoredEvent } from 'Notifications/Application/UseCase/ProcessStoredEvent';
import { TransferNotification } from 'Notifications/Application/UseCase/TransferNotification';
import { Notifications } from 'Notifications/index';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';
import { StoredEventsController } from 'Notifications/Port/Api/StoredEventsController';
import { CreateStoredEvent } from 'Notifications/Application/UseCase/CreateStoredEvent';
import { EmailController } from 'Notifications/Port/Api/EmailController';
import { EmailSender } from 'Notifications/Adapter/SES/EmailSender';

export class PortsProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(NotificationsController, [DismissNotifications, NotificationQuery, TransferNotification, CreateStoredEvent]);
    container.addSingleton(StoredEventsController, [StoredEventRepository, ProcessStoredEvent, AccountActivitiesRepository, PushNotificationRepository]);
    container.addSingleton(EmailController, [EmailSender]);
  }
}
