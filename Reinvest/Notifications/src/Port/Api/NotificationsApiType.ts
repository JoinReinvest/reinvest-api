import { ContainerInterface } from 'Container/Container';
import { NotificationsController } from 'Notifications/Port/Api/NotificationsController';

export type NotificationsApiType = {
  createNotifications: NotificationsController['createNotification'];
};

export const NotificationsApi = (container: ContainerInterface): NotificationsApiType => ({
  createNotifications: container.delegateTo(NotificationsController, 'createNotification'),
});
