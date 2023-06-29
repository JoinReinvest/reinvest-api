import { ContainerInterface } from 'Container/Container';
import { CreateNotification } from 'Notifications/Application/UseCase/CreateNotification';
import { DismissNotifications } from 'Notifications/Application/UseCase/DismissNotifications';
import { Notifications } from 'Notifications/index';
import { NotificationEventHandler } from 'Notifications/Port/Queue/EventHandler/NotificationEventHandler';
import { StoreEventsHandler } from 'Notifications/Port/Queue/EventHandler/StoreEventsHandler';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { IdGenerator } from 'IdGenerator/IdGenerator';

export default class EventBusProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(NotificationEventHandler, [CreateNotification, DismissNotifications]);
    container.addSingleton(StoreEventsHandler, [StoredEventRepository, IdGenerator]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
