import { ContainerInterface } from 'Container/Container';
import { NotificationEventHandler } from 'Notifications/Port/Queue/EventHandler/NotificationEventHandler';

export type NotificationsTechnicalHandlerType = {
  CreateNotification: NotificationEventHandler['handle'];
  DismissNotification: NotificationEventHandler['handle'];
};

export const NotificationsTechnicalHandler = (container: ContainerInterface): NotificationsTechnicalHandlerType => ({
  CreateNotification: container.delegateTo(NotificationEventHandler, 'handle'),
  DismissNotification: container.delegateTo(NotificationEventHandler, 'handle'),
});
