import { ContainerInterface } from 'Container/Container';
import { Notifications } from 'Notifications/index';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';
import { CreateNotification } from 'Notifications/UseCase/CreateNotification';

export class PortsProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(NotificationsController, [CreateNotification]);
  }
}
