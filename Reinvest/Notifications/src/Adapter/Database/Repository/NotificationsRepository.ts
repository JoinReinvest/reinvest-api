import { NotificationsDatabaseAdapterProvider } from 'Notifications/Adapter/Database/DatabaseAdapter';

export class NotificationsRepository {
  private databaseAdapterProvider: NotificationsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: NotificationsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'NotificationsRepository';
}
