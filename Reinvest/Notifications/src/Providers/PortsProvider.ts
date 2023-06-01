import { ContainerInterface } from 'Container/Container';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { NotificationQuery } from 'Notifications/Application/UseCase/NotificationQuery';
import { Notifications } from 'Notifications/index';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';

export class PortsProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(NotificationsController, [CreateNotification, DismissNotifications, NotificationQuery]);
  }
}
