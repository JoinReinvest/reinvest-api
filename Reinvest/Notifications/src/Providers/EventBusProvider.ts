import { ContainerInterface } from 'Container/Container';
import { Notifications } from 'Notifications/index';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { NotificationEventHandler } from 'Notifications/Port/Queue/EventHandler/NotificationEventHandler';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';

export default class EventBusProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(NotificationEventHandler, [CreateNotification, DismissNotifications]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
