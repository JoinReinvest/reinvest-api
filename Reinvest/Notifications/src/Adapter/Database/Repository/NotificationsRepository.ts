import { NotificationsDatabaseAdapterProvider, notificationsTable } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { NotificationsTable } from 'Notifications/Adapter/Database/NotificationsSchema';
import { Notification } from 'Notifications/Domain/Notification';

export class NotificationsRepository {
  private databaseAdapterProvider: NotificationsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: NotificationsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'NotificationsRepository';

  async store(notification: Notification): Promise<void> {
    const values = <NotificationsTable>notification.toObject();

    await this.databaseAdapterProvider
      .provide()
      .insertInto(notificationsTable)
      .values(values)
      .onConflict(oc => oc.column('uniqueId').doNothing())
      .execute();
  }

  async setReadToTrue(profileId: string, dismissIds: string[]) {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(notificationsTable)
      .set({
        dateRead: new Date(),
        isRead: true,
      })
      .where('profileId', '=', profileId)
      .where('dateRead', 'is', null)
      .where('dismissId', 'in', dismissIds)
      .execute();
  }
}
