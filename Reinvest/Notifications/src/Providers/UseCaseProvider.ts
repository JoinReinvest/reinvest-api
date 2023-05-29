import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';
import { Notifications } from 'Notifications/index';
import { CreateNotification } from 'Notifications/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/UseCase/DismissNotifications';

export class UseCaseProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateNotification, [NotificationsRepository, IdGenerator]);
    container.addSingleton(DismissNotifications, [NotificationsRepository]);
  }
}
