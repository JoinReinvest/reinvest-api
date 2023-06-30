import { ContainerInterface } from 'Container/Container';
import { NotificationEventHandler } from 'Notifications/Port/Queue/EventHandler/NotificationEventHandler';
import { StoreEventsHandler } from 'Notifications/Port/Queue/EventHandler/StoreEventsHandler';

export type NotificationsTechnicalHandlerType = {
  CreateNotification: NotificationEventHandler['handle'];
  DismissNotification: NotificationEventHandler['handle'];
  StoreEventCommand: StoreEventsHandler['handle'];
};

export const NotificationsTechnicalHandler = (container: ContainerInterface): NotificationsTechnicalHandlerType => ({
  CreateNotification: container.delegateTo(NotificationEventHandler, 'handle'),
  DismissNotification: container.delegateTo(NotificationEventHandler, 'handle'),
  StoreEventCommand: container.delegateTo(StoreEventsHandler, 'handle'),
});
