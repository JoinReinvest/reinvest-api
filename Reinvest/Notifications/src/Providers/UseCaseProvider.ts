import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationQuery } from 'Notifications/Application/UseCase/NotificationQuery';
import { Notifications } from 'Notifications/index';
import { ProcessStoredEvent } from 'Notifications/Application/UseCase/ProcessStoredEvent';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';

export class UseCaseProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateNotification, [NotificationsRepository, IdGenerator]);
    container.addSingleton(DismissNotifications, [NotificationsRepository]);
    container.addSingleton(NotificationQuery, [NotificationsRepository]);
    container.addSingleton(ProcessStoredEvent, [StoredEventRepository, AccountActivitiesRepository, CreateNotification]);
  }
}
