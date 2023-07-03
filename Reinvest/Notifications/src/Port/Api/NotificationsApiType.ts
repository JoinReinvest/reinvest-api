import { ContainerInterface } from 'Container/Container';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';
import { StoredEventsController } from 'Notifications/Port/Api/StoredEventsController';

export type NotificationsApiType = {
  createNotification: NotificationsController['createNotification'];
  dismissNotifications: NotificationsController['dismissNotifications'];
  getNotifications: NotificationsController['getNotifications'];
  getNotificationsStats: NotificationsController['getNotificationsStats'];
  listAccountActivities: StoredEventsController['listAccountActivities'];
  listStoredEventsIds: StoredEventsController['listStoredEventsIds'];
  processStoredEvent: StoredEventsController['processStoredEvent'];
  registerPushNotificationDevice: StoredEventsController['registerPushNotificationDevice'];
};

export const NotificationsApi = (container: ContainerInterface): NotificationsApiType => ({
  createNotification: container.delegateTo(NotificationsController, 'createNotification'),
  dismissNotifications: container.delegateTo(NotificationsController, 'dismissNotifications'),
  getNotifications: container.delegateTo(NotificationsController, 'getNotifications'),
  getNotificationsStats: container.delegateTo(NotificationsController, 'getNotificationsStats'),
  listStoredEventsIds: container.delegateTo(StoredEventsController, 'listStoredEventsIds'),
  processStoredEvent: container.delegateTo(StoredEventsController, 'processStoredEvent'),
  listAccountActivities: container.delegateTo(StoredEventsController, 'listAccountActivities'),
  registerPushNotificationDevice: container.delegateTo(StoredEventsController, 'registerPushNotificationDevice'),
});
