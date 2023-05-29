import { ContainerInterface } from 'Container/Container';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';

export type NotificationsApiType = {
  createNotification: NotificationsController['createNotification'];
  dismissNotifications: NotificationsController['dismissNotifications'];
};

export const NotificationsApi = (container: ContainerInterface): NotificationsApiType => ({
  createNotification: container.delegateTo(NotificationsController, 'createNotification'),
  dismissNotifications: container.delegateTo(NotificationsController, 'dismissNotifications'),
});
