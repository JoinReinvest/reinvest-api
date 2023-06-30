import { AccountActivitiesTable, NotificationsTable, StoredEventsTable } from 'Notifications/Adapter/Database/NotificationsSchema';
import { DatabaseProvider, PostgreSQLConfig } from 'PostgreSQL/DatabaseProvider';

export const notificationsTable = 'notifications_notifications';
export const storedEventsTable = 'notifications_stored_events';
export const accountActivitiesTable = 'notifications_account_activities';

export interface NotificationsDatabase {
  [accountActivitiesTable]: AccountActivitiesTable;
  [notificationsTable]: NotificationsTable;
  [storedEventsTable]: StoredEventsTable;
}

export const NotificationsDatabaseAdapterInstanceProvider = 'NotificationsDatabaseAdapterProvider';
export type NotificationsDatabaseAdapterProvider = DatabaseProvider<NotificationsDatabase>;

export function createNotificationsDatabaseAdapterProvider(config: PostgreSQLConfig): NotificationsDatabaseAdapterProvider {
  return new DatabaseProvider<NotificationsDatabase>(config);
}
