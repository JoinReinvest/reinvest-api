import { ContainerInterface } from 'Container/Container';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';
import { StoredEventsController } from 'Notifications/Port/Api/StoredEventsController';
import { EmailController } from 'Notifications/Port/Api/EmailController';

export type NotificationsApiType = {
  createStoredEvent: NotificationsController['createStoredEvent'];
  dismissNotifications: NotificationsController['dismissNotifications'];
  getNotifications: NotificationsController['getNotifications'];
  getNotificationsStats: NotificationsController['getNotificationsStats'];
  listAccountActivities: StoredEventsController['listAccountActivities'];
  listStoredEventsIds: StoredEventsController['listStoredEventsIds'];
  processStoredEvent: StoredEventsController['processStoredEvent'];
  sendEmail: EmailController['sendEmail'];
  registerPushNotificationDevice: StoredEventsController['registerPushNotificationDevice'];
  transferNotificationToAccount: NotificationsController['transferNotificationToAccount'];
};

export const NotificationsApi = (container: ContainerInterface): NotificationsApiType => ({
  createStoredEvent: container.delegateTo(NotificationsController, 'createStoredEvent'),
  dismissNotifications: container.delegateTo(NotificationsController, 'dismissNotifications'),
  getNotifications: container.delegateTo(NotificationsController, 'getNotifications'),
  getNotificationsStats: container.delegateTo(NotificationsController, 'getNotificationsStats'),
  listStoredEventsIds: container.delegateTo(StoredEventsController, 'listStoredEventsIds'),
  processStoredEvent: container.delegateTo(StoredEventsController, 'processStoredEvent'),
  listAccountActivities: container.delegateTo(StoredEventsController, 'listAccountActivities'),
  registerPushNotificationDevice: container.delegateTo(StoredEventsController, 'registerPushNotificationDevice'),
  transferNotificationToAccount: container.delegateTo(NotificationsController, 'transferNotificationToAccount'),
  sendEmail: container.delegateTo(EmailController, 'sendEmail'),
});
