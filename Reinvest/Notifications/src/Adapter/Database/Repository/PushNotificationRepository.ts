import { UUID } from 'HKEKTypes/Generics';
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator';
import { DateTime } from 'Money/DateTime';
import { NotificationsDatabaseAdapterProvider, registeredPushDevicesTable } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { PushNotificationAdapter } from 'Notifications/Adapter/PushNotificationAdapter';

export class PushNotificationRepository {
  private databaseAdapterProvider: NotificationsDatabaseAdapterProvider;
  private pushNotificationAdapter: PushNotificationAdapter;
  private idGenerator: IdGeneratorInterface;

  constructor(
    databaseAdapterProvider: NotificationsDatabaseAdapterProvider,
    pushNotificationAdapter: PushNotificationAdapter,
    idGenerator: IdGeneratorInterface,
  ) {
    this.databaseAdapterProvider = databaseAdapterProvider;
    this.pushNotificationAdapter = pushNotificationAdapter;
    this.idGenerator = idGenerator;
  }

  public static getClassName = (): string => 'PushNotificationRepository';

  private async getDeviceIdsByProfileId(profileId: UUID): Promise<string[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(registeredPushDevicesTable)
      .select(['deviceId'])
      .where('profileId', '=', profileId)
      .where('dateUpdated', '>', DateTime.daysAgo(60).toDate())
      .execute();

    if (!data) {
      return [];
    }

    return data.map(record => record.deviceId);
  }

  async pushNotification(profileId: UUID, title: string, body: string) {
    const deviceIds = await this.getDeviceIdsByProfileId(profileId);

    for (const deviceId of deviceIds) {
      await this.pushNotificationAdapter.sendNotification({
        body,
        title,
        token: deviceId,
      });
    }
  }

  async registerDevice(profileId: UUID, deviceId: string) {
    try {
      const id = this.idGenerator.createUuid();
      await this.databaseAdapterProvider
        .provide()
        .insertInto(registeredPushDevicesTable)
        .values({
          id,
          profileId,
          deviceId,
          dateUpdated: DateTime.now().toDate(),
        })
        .onConflict(oc =>
          oc.constraint('profile_device_unique').doUpdateSet({
            dateUpdated: eb => eb.ref(`excluded.dateUpdated`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store device id ${deviceId} for profile ${profileId}`, error);

      return false;
    }
  }
}
