import { NotificationsTable } from 'Notifications/Adapter/Database/NotificationsSchema';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const notificationsTable = 'notifications_notifications';

export interface NotificationsDatabase {
  [notificationsTable]: NotificationsTable;
}

export const NotificationsDatabaseAdapterInstanceProvider = 'NotificationsDatabaseAdapterProvider';
export type NotificationsDatabaseAdapterProvider = DatabaseProvider<NotificationsDatabase>;

export function createNotificationsDatabaseAdapterProvider(config: PostgreSQLConfig): NotificationsDatabaseAdapterProvider {
  return new DatabaseProvider<NotificationsDatabase>(config);
}
