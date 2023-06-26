import { Kysely } from 'kysely';
import { NotificationsDatabase, notificationsTable } from 'Notifications/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema
    .alterTable(notificationsTable)
    .alterColumn('dismissId', col => col.setDataType('varchar(255)'))
    .alterColumn('uniqueId', col => col.setDataType('varchar(255)'))
    .execute();
}

export async function down(db: Kysely<NotificationsDatabase>): Promise<void> {
  return;
}
