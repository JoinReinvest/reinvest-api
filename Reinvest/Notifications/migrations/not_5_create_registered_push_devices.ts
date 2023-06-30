import { Kysely } from 'kysely';
import { NotificationsDatabase, registeredPushDevicesTable } from 'Notifications/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema
    .createTable(registeredPushDevicesTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('dateUpdated', 'timestamp', col => col.notNull())
    .addColumn('deviceId', 'text', col => col.notNull())
    .execute();

  await db.schema.alterTable(registeredPushDevicesTable).addUniqueConstraint('profile_device_unique', ['profileId', 'deviceId']).execute();
}

export async function down(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema.alterTable(registeredPushDevicesTable).dropConstraint('profile_device_unique').execute();
  await db.schema.dropTable(registeredPushDevicesTable).execute();
}
