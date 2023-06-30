import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { createNotificationsDatabaseAdapterProvider, NotificationsDatabaseAdapterInstanceProvider } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { AccountActivitiesRepository } from 'Notifications/Adapter/Database/Repository/AccountActivitiesRepository';
import { NotificationsRepository } from 'Notifications/Adapter/Database/Repository/NotificationsRepository';
import { PushNotificationRepository } from 'Notifications/Adapter/Database/Repository/PushNotificationRepository';
import { StoredEventRepository } from 'Notifications/Adapter/Database/Repository/StoredEventRepository';
import { PushNotificationAdapter } from 'Notifications/Adapter/PushNotificationAdapter';
import { Notifications } from 'Notifications/index';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export class AdapterServiceProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender])
      .addObjectFactory('PushNotificationQueueSender', () => new QueueSender(this.config.firebaseQueue), [])
      .addSingleton(PushNotificationAdapter, ['PushNotificationQueueSender']);

    // db
    container
      .addAsValue(NotificationsDatabaseAdapterInstanceProvider, createNotificationsDatabaseAdapterProvider(this.config.database))
      .addSingleton(NotificationsRepository, [NotificationsDatabaseAdapterInstanceProvider])
      .addSingleton(StoredEventRepository, [NotificationsDatabaseAdapterInstanceProvider])
      .addSingleton(AccountActivitiesRepository, [NotificationsDatabaseAdapterInstanceProvider])
      .addSingleton(PushNotificationRepository, [NotificationsDatabaseAdapterInstanceProvider, PushNotificationAdapter, IdGenerator]);
  }
}
