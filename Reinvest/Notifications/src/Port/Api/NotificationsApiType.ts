import { ContainerInterface } from 'Container/Container';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';

export type NotificationsApiType = {
  createNotification: NotificationsController['createNotification'];
  dismissNotifications: NotificationsController['dismissNotifications'];
  getNotifications: NotificationsController['getNotifications'];
};

export const NotificationsApi = (container: ContainerInterface): NotificationsApiType => ({
  createNotification: container.delegateTo(NotificationsController, 'createNotification'),
  dismissNotifications: container.delegateTo(NotificationsController, 'dismissNotifications'),
  getNotifications: container.delegateTo(NotificationsController, 'getNotifications'),
});
